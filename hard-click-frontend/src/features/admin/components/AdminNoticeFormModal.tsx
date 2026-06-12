'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

interface AdminNoticeFormModalProps {
  mode: 'create' | 'edit';
  /** 강의 공지면 대상 강의명, 시스템 공지면 undefined */
  courseTitle?: string;
  initialTitle?: string;
  initialContent?: string;
  initialIsPinned?: boolean;
  onClose: () => void;
}

export default function AdminNoticeFormModal({
  mode,
  courseTitle,
  initialTitle = '',
  initialContent = '',
  initialIsPinned = false,
  onClose,
}: AdminNoticeFormModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const isFormValid = title.trim() !== '' && content.trim() !== '';

  const handleSubmit = () => {
    setSubmitted(true);
    const titleEmpty = !title.trim();
    const contentEmpty = !content.trim();
    if (titleEmpty) setTitleError('제목을 입력해주세요');
    if (contentEmpty) setContentError('내용을 입력해주세요');
    if (titleEmpty || contentEmpty) {
      if (titleEmpty) titleRef.current?.focus();
      else contentRef.current?.focus();
      return;
    }
    // TODO: create/update notice 연동 (mock 단계)
    toast.success(
      mode === 'edit'
        ? '공지사항이 수정되었습니다.'
        : '공지사항이 등록되었습니다.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-xl font-bold text-[#1F2937]">
          {mode === 'edit' ? '공지 수정' : '공지 작성'}
        </h2>

        {/* 대상 강의 — 강의 공지일 때만 */}
        {courseTitle && (
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              대상 강의
            </label>
            <div className="flex h-11 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#1E293B]">
              {courseTitle}
            </div>
          </div>
        )}

        {/* 제목 */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-[#374151]">
            제목 *
          </label>
          <input
            ref={titleRef}
            type="text"
            placeholder="공지사항 제목을 입력하세요"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (submitted)
                setTitleError(
                  e.target.value.trim() === '' ? '제목을 입력해주세요' : ''
                );
            }}
            className={`h-11 w-full rounded-xl border px-4 text-sm outline-none placeholder:text-[#9CA3AF] ${
              titleError ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
            }`}
          />
          <div className="mt-1 flex min-h-[20px] items-center gap-1 text-xs text-[#EF4444]">
            {titleError && (
              <>
                <Image
                  src="/icons/error.svg"
                  alt="error"
                  width={12}
                  height={12}
                />
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
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (submitted)
                setContentError(
                  e.target.value.trim() === '' ? '내용을 입력해주세요' : ''
                );
            }}
            rows={5}
            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none placeholder:text-[#9CA3AF] ${
              contentError ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
            }`}
          />
          <div className="mt-1 flex min-h-[20px] items-center gap-1 text-xs text-[#EF4444]">
            {contentError && (
              <>
                <Image
                  src="/icons/error.svg"
                  alt="error"
                  width={12}
                  height={12}
                />
                {contentError}
              </>
            )}
          </div>
        </div>

        {/* 중요 공지 체크박스 */}
        <label className="mb-6 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="h-4 w-4 accent-[#2F5DAA]"
          />
          <span className="text-sm text-[#374151]">
            중요 공지로 설정 (상단 고정)
          </span>
        </label>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`h-12 flex-1 rounded-xl text-sm font-semibold text-white transition ${
              isFormValid
                ? 'bg-[#2F5DAA] hover:bg-[#1D3E75]'
                : 'bg-[#2F5DAA] opacity-50 cursor-not-allowed'
            }`}
          >
            {mode === 'edit' ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}
