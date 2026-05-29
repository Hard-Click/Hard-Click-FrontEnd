'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getNoticeDetailAction } from '@/features/notices/actions';
import type { NoticeDetail } from '@/features/notices/types';

const MOCK_NOTICE: NoticeDetail = {
  noticeId: 1,
  title: '⚠️ 서버 점검 안내 (5월 10일 02:00~04:00)',
  content:
    '안녕하세요.\n\n서버 점검으로 인해 아래 일정 동안 서비스 이용이 일시 중단됩니다.\n\n■ 점검 일시: 2026년 5월 10일 (일) 02:00 ~ 04:00\n■ 점검 내용: 서버 인프라 업그레이드 및 보안 패치\n\n점검 시간 동안은 모든 서비스(강의 수강, 게시판, 결제 등)를 이용하실 수 없습니다.\n\n이용에 불편을 드려 죄송합니다.\n감사합니다.',
  authorName: '관리자',
  noticeType: 'GLOBAL',
  isPinned: true,
  createdAt: '2026-05-01T09:00:00',
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default function StudentNoticeDetailPage() {
  const { noticeid } = useParams();
  const router = useRouter();

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!noticeid) return;
    getNoticeDetailAction(Number(noticeid)).then((result) => {
      if (result.success && result.data) {
        setNotice(result.data);
      } else {
        setNotice(MOCK_NOTICE);
      }
      setIsLoading(false);
    });
  }, [noticeid]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="py-20 text-center text-[#64748B]">불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="py-20 text-center text-[#64748B]">
            공지사항을 찾을 수 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[760px]">
        {/* 목록으로 돌아가기 */}
        <button
          type="button"
          onClick={() => router.push('/notices')}
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4B5563]"
        >
          <Image src="/icons/back.svg" alt="back" width={16} height={16} />
          목록으로 돌아가기
        </button>

        {/* 공지 카드 */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          {/* 뱃지 */}
          <div className="mb-4 flex items-center gap-2">
            {notice.isPinned && (
              <span className="flex items-center gap-1 rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#B91C1C]">
                <Image
                  src="/icons/noticePin.svg"
                  alt="pin"
                  width={12}
                  height={12}
                />
                중요
              </span>
            )}
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
              {notice.noticeType === 'GLOBAL' ? '전체 공지' : '강의 공지'}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="mb-4 text-2xl font-bold text-[#1E293B]">
            {notice.title}
          </h1>

          {/* 작성자 · 날짜 */}
          <div className="mb-6 flex items-center gap-2 text-sm text-[#64748B]">
            <span>{notice.authorName}</span>
            <span>•</span>
            <span>{formatDate(notice.createdAt)}</span>
          </div>

          {/* 구분선 */}
          <div className="mb-6 h-px bg-[#E2E8F0]" />

          {/* 본문 */}
          <p className="whitespace-pre-line text-sm leading-7 text-[#374151]">
            {notice.content}
          </p>
        </div>

        {/* 이전 공지 네비게이션 (추후 연결 예정) */}
        <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 shadow-sm">
          <p className="mb-1 text-xs text-[#94A3B8]">&gt; 이전 공지</p>
          <p className="text-sm font-semibold text-[#1E293B]">
            이전 공지사항 제목
          </p>
        </div>
      </div>
    </div>
  );
}
