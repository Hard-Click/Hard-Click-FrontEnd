'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { getNoticeDetailAction, deleteNoticeAction } from '@/features/notices/actions';
import type { NoticeDetail } from '@/features/notices/types';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default function InstructorNoticeDetailPage() {
  const { noticeId } = useParams();
  const router = useRouter();

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!noticeId) return;
    getNoticeDetailAction(Number(noticeId)).then((result) => {
      if (result.success && result.data) {
        setNotice(result.data);
      }
      setIsLoading(false);
    });
  }, [noticeId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteNoticeAction(Number(noticeId));
    setIsDeleting(false);
    setIsDeleteConfirmOpen(false);
    if (!result.success) {
      toast.error(result.message || '삭제에 실패했습니다.');
      return;
    }
    toast.success('공지사항이 삭제되었습니다.');
    router.push('/instructor/notices');
  };

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
    <>
      {/* 삭제 확인 모달 */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-center text-xl font-bold text-[#1F2937]">
              공지사항 삭제
            </h2>
            <p className="mt-3 text-center text-sm text-[#4B5563]">
              해당 공지사항을 삭제하시겠습니까?
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-12 flex-1 rounded-xl bg-[#B91C1C] text-sm font-semibold text-white transition hover:bg-[#991B1B] disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
        <div className="mx-auto w-full max-w-[760px]">
          {/* 목록으로 돌아가기 */}
          <button
            type="button"
            onClick={() => router.push('/instructor/notices')}
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

            {/* 수정/삭제 버튼 */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  /* 수정 기능 추후 연결 예정 */
                }}
                className="h-10 rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="h-10 rounded-xl bg-[#B91C1C] px-5 text-sm font-semibold text-white transition hover:bg-[#991B1B]"
              >
                삭제
              </button>
            </div>
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
    </>
  );
}
