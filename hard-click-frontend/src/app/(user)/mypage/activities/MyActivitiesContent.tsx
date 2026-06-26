'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ACTIVITY_BOARD_LABEL } from '@/features/mypage/types';
import type { MyActivities } from '@/features/mypage/types';
import BackButton from '@/components/common/BackButton';

/** ISO 날짜 → YYYY.MM.DD */
function formatDisplayDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

type TabKey = 'posts' | 'comments' | 'reviews';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'posts', label: '작성한 글' },
  { key: 'comments', label: '작성한 댓글' },
  { key: 'reviews', label: '작성한 수강평' },
];

/* 별점 (정수 1~5) */
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={i}
          src={i <= rating ? '/icons/starFilledIcon.svg' : '/icons/starEmptyIcon.svg'}
          width={16}
          height={16}
          alt=""
        />
      ))}
    </div>
  );
}

/**
 * 내 활동 화면의 client 잎사귀 — 데이터는 서버 페이지에서 props로 받고,
 * 탭 전환 상호작용만 client에서 처리한다.
 */
export default function MyActivitiesContent({
  activities,
}: {
  activities: MyActivities;
}) {
  const [tab, setTab] = useState<TabKey>('posts');

  const counts = {
    posts: activities.posts.length,
    comments: activities.comments.length,
    reviews: activities.reviews.length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full">
        <div className="max-w-[1280px] mx-auto px-8 pt-9 pb-32">
          {/* 페이지 히어로 */}
          <div className="flex items-center gap-4 mb-8">
            <BackButton
              ariaLabel="뒤로가기"
              className="w-6 h-6 flex items-center justify-center text-[#4B5563] hover:text-[#1F2937]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </BackButton>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2F5DAA] rounded-[20px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/bookIcon.svg" width={28} height={28} alt="" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <h1 className="text-[30px] font-bold leading-9 text-[#1F2937] tracking-[0.4px]">내 활동</h1>
              </div>
              <p className="text-base text-[#4B5563]">내가 작성한 글, 댓글, 수강평을 확인하세요.</p>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`h-11 px-5 rounded-[10px] text-base font-semibold transition-colors ${
                  tab === t.key
                    ? 'bg-[#2F5DAA] text-white'
                    : 'bg-white border border-[#E2E8F0] text-[#4B5563] hover:bg-[#F8FAFC]'
                }`}
              >
                {t.label} {counts[t.key]}
              </button>
            ))}
          </div>

          {/* 콘텐츠 카드 */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] p-[33px] flex flex-col gap-4">
            {tab === 'posts' &&
              (counts.posts === 0 ? (
                <EmptyState text="작성한 글이 없습니다." />
              ) : (
                activities.posts.map((p) => (
                  <Link
                    key={p.postId}
                    href={`/community/${p.postId}`}
                    className="border border-[#E2E8F0] rounded-[20px] p-5 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-0.5 bg-[rgba(47,93,170,0.1)] text-[#2F5DAA] text-xs font-semibold rounded">
                        {ACTIVITY_BOARD_LABEL[p.boardType] ?? p.boardType}
                      </span>
                      {p.accepted && (
                        <span className="px-3 py-0.5 bg-[rgba(22,163,74,0.1)] text-[#16A34A] text-xs font-semibold rounded">
                          채택
                        </span>
                      )}
                      <span className="text-xs text-[#9CA3AF] ml-auto">{formatDisplayDate(p.createdAt)}</span>
                    </div>
                    <p className="text-lg font-semibold text-[#1F2937] line-clamp-1">{p.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#4B5563]">
                      <span>조회 {p.viewCount}</span>
                    </div>
                  </Link>
                ))
              ))}

            {tab === 'comments' &&
              (counts.comments === 0 ? (
                <EmptyState text="작성한 댓글이 없습니다." />
              ) : (
                activities.comments.map((c) => (
                  <Link
                    key={c.commentId}
                    href={`/community/${c.postId}`}
                    className="border border-[#E2E8F0] rounded-[20px] p-5 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {c.parentId != null && (
                        <span className="px-3 py-0.5 bg-[rgba(75,85,99,0.1)] text-[#4B5563] text-xs font-semibold rounded">
                          답글
                        </span>
                      )}
                      {c.accepted && (
                        <span className="px-3 py-0.5 bg-[rgba(22,163,74,0.1)] text-[#16A34A] text-xs font-semibold rounded">
                          채택
                        </span>
                      )}
                      <span className="text-xs text-[#9CA3AF] ml-auto">{formatDisplayDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#4B5563] line-clamp-2">{c.content}</p>
                  </Link>
                ))
              ))}

            {tab === 'reviews' &&
              (counts.reviews === 0 ? (
                <EmptyState text="작성한 수강평이 없습니다." />
              ) : (
                activities.reviews.map((r) => (
                  <Link
                    key={r.reviewId}
                    href={`/courses/${r.courseId}#reviews`}
                    className="border border-[#E2E8F0] rounded-[20px] p-5 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <StarRow rating={r.rating} />
                      <span className="text-xs text-[#9CA3AF] ml-auto">{formatDisplayDate(r.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#4B5563] line-clamp-2">{r.content}</p>
                  </Link>
                ))
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
      <p className="text-xl font-bold text-[#1F2937]">{text}</p>
    </div>
  );
}
