'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { deleteNoticeAction } from '@/features/notices/actions';
import { updateNotice } from '@/features/notices/services';
import NoticeBackButton from '@/features/notices/components/NoticeBackButton';
import type { NoticeDetail } from '@/features/notices/types';

// TODO: API 연동 시 교체
const MOCK_COURSES = [
  { id: 1, title: '수1 정복하기' },
  { id: 2, title: '영어 독해 완성' },
];

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default function InstructorNoticeDetailContent({
  initialNotice,
}: {
  initialNotice: NoticeDetail;
}) {
  const { noticeId } = useParams();
  const router = useRouter();

  const [notice, setNotice] = useState<NoticeDetail | null>(initialNotice);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const isFormValid = formTitle.trim() !== '' && formContent.trim() !== '';

  const openEditModal = () => {
    if (!notice) return;
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setFormIsPinned(notice.isPinned);
    setTitleError('');
    setContentError('');
    setSubmitted(false);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    setSubmitted(true);
    const isTitleEmpty = !formTitle.trim();
    const isContentEmpty = !formContent.trim();
    if (isTitleEmpty) setTitleError('제목을 입력해주세요');
    if (isContentEmpty) setContentError('내용을 입력해주세요');
    if (isTitleEmpty || isContentEmpty) {
      if (isTitleEmpty) titleRef.current?.focus();
      else contentRef.current?.focus();
      return;
    }
    setIsEditConfirmOpen(true);
  };

  const handleEditConfirm = async () => {
    // PATCH /api/notices/{noticeId}
    const result = await updateNotice(Number(noticeId), {
      title: formTitle.trim(),
      content: formContent.trim(),
      isPinned: formIsPinned,
    });
    if (!result.success) {
      toast.error(result.message || '공지사항 수정에 실패했습니다.');
      return;
    }
    setNotice((prev) =>
      prev
        ? { ...prev, title: formTitle.trim(), content: formContent.trim(), isPinned: formIsPinned }
        : prev,
    );
    setIsEditConfirmOpen(false);
    setIsEditModalOpen(false);
    toast.success(result.message || '공지사항이 수정되었습니다.');
  };

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

  // 대상 강의명 (TODO: API 연동 시 notice에서 받아오기)
  const courseTitle = MOCK_COURSES[0].title;

  return (
    <>
      {/* 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-xl font-bold text-[#1F2937]">공지 수정</h2>

            {/* 대상 강의 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                대상 강의
              </label>
              <div className="flex h-11 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#1E293B]">
                {courseTitle}
              </div>
            </div>

            {/* 제목 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                제목 *
              </label>
              <input
                ref={titleRef}
                type="text"
                placeholder="공지사항 제목을 입력하세요"
                value={formTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormTitle(val);
                  if (submitted)
                    setTitleError(val.trim() === '' ? '제목을 입력해주세요' : '');
                }}
                className={`h-11 w-full rounded-xl border px-4 text-sm outline-none placeholder:text-[#9CA3AF] ${
                  titleError ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
                }`}
              />
              <div className="mt-1 flex min-h-[20px] items-center gap-1 text-xs text-[#EF4444]">
                {titleError && (
                  <>
                    <Image src="/icons/error.svg" alt="error" width={12} height={12} />
                    {titleError}
                  </>
                )}
              </div>
            </div>

            {/* 내용 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                내용 *
              </label>
              <textarea
                ref={contentRef}
                placeholder="공지사항 내용을 입력하세요"
                value={formContent}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormContent(val);
                  if (submitted)
                    setContentError(val.trim() === '' ? '내용을 입력해주세요' : '');
                }}
                rows={5}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none placeholder:text-[#9CA3AF] ${
                  contentError && formTitle.trim() !== ''
                    ? 'border-[#EF4444]'
                    : 'border-[#E2E8F0]'
                }`}
              />
              <div className="mt-1 flex min-h-[20px] items-center gap-1 text-xs text-[#EF4444]">
                {contentError && (
                  <>
                    <Image src="/icons/error.svg" alt="error" width={12} height={12} />
                    {contentError}
                  </>
                )}
              </div>
            </div>

            {/* 중요 공지 체크박스 */}
            <label className="mb-6 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formIsPinned}
                onChange={(e) => setFormIsPinned(e.target.checked)}
                className="h-4 w-4 accent-[#2F5DAA]"
              />
              <span className="text-sm text-[#374151]">중요 공지로 설정 (상단 고정)</span>
            </label>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                className={`h-12 flex-1 rounded-xl text-sm font-semibold text-white transition ${
                  isFormValid ? 'bg-[#2F5DAA] hover:bg-[#1D3E75]' : 'bg-[#2F5DAA] opacity-50'
                }`}
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 확인 모달 */}
      {isEditConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[448px] rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-center text-2xl font-bold text-[#1F2937]">공지 수정</h2>
            <p className="mt-3 text-center text-base text-[#4B5563]">수정하시겠습니까?</p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditConfirmOpen(false)}
                className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEditConfirm}
                className="h-12 flex-1 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-center text-xl font-bold text-[#1F2937]">공지사항 삭제</h2>
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
          {/* 뒤로가기 — 공용 컴포넌트로 통합 (실제 이전 페이지 복귀, 없으면 공지 관리) */}
          <NoticeBackButton fallbackHref="/instructor/notices" />

          {/* 공지 카드 */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            {/* 뱃지 */}
            <div className="mb-4 flex items-center gap-2">
              {notice.isPinned && (
                <span className="flex items-center gap-1 rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#B91C1C]">
                  <Image src="/icons/noticePin.svg" alt="pin" width={12} height={12} />
                  중요
                </span>
              )}
              <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
                {notice.noticeType === 'GLOBAL' ? '전체 공지' : '강의 공지'}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="mb-4 text-2xl font-bold text-[#1E293B]">{notice.title}</h1>

            {/* 작성자 · 날짜 */}
            <div className="mb-6 flex items-center gap-2 text-sm text-[#64748B]">
              <span>{notice.courseName ?? '관리자'}</span>
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
                onClick={openEditModal}
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

          {/* 이전 공지 네비게이션 */}
          <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 shadow-sm">
            <p className="mb-1 text-xs text-[#94A3B8]">&gt; 이전 공지</p>
            <p className="text-sm font-semibold text-[#1E293B]">이전 공지사항 제목</p>
          </div>
        </div>
      </div>
    </>
  );
}
