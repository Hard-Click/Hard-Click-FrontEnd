'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import LoadingModal from '@/components/ui/loadingModal';

interface ReviewFormModalProps {
  courseTitle?: string;
  initialRating?: number;
  initialContent?: string;
  /** 수정 모드 시 헤더/버튼 라벨 변경 */
  mode?: 'create' | 'edit';
  onCancel: () => void;
  onSubmit: (rating: number, content: string) => void;
}

const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 300;
// 부적절 표현 mock 검출용 (실제 API 연동 시 백엔드가 검출)
const BAD_WORDS = [
  '욕설', '광고', '비방',
  '씨발', '시발', '시팔', '씨팔', 'ㅅㅂ',
  '병신', 'ㅂㅅ', '좆', '존나', 'ㅈㄴ',
  '개새끼', '개새', '새끼', 'ㄲㅈ', '꺼져',
  'fuck', 'shit', 'bitch',
];

export default function ReviewFormModal({
  initialRating = 0,
  initialContent = '',
  mode = 'create',
  onCancel,
  onSubmit,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [contentError, setContentError] = useState('');
  const [contentHighlight, setContentHighlight] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayedRating = hoverRating || rating;
  const isTextareaInvalid = !!contentError || contentHighlight;

  const handleRegisterClick = () => {
    let hasError = false;
    if (rating === 0) {
      setRatingError('별점을 선택해주세요');
      hasError = true;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      setContentError(`최대 ${MAX_CONTENT_LENGTH}자까지 입력할 수 있습니다.`);
      textareaRef.current?.focus();
      hasError = true;
    } else if (content.trim().length < MIN_CONTENT_LENGTH) {
      setContentError('최소 10자 이상 입력해주세요.');
      textareaRef.current?.focus();
      hasError = true;
    }
    if (hasError) return;

    // TODO: 실제 API 연동 시 — POST /api/courses/{courseId}/reviews
    // 백엔드가 부적절 표현 검출 시 응답 코드 (예: 400 + errorCode=INAPPROPRIATE)로 내려주면
    // 그 응답을 받아서 setIsErrorOpen(true) 처리
    if (BAD_WORDS.some((w) => content.includes(w))) {
      setIsErrorOpen(true);
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleErrorConfirm = () => {
    setIsErrorOpen(false);
    setContentHighlight(true);
    // 리뷰 모달이 다시 렌더된 후 focus 이동
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleRatingChange = (value: number) => {
    setRating(value);
    if (ratingError) setRatingError('');
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    if (contentHighlight) setContentHighlight(false);
    if (value.length > MAX_CONTENT_LENGTH) {
      setContentError(`최대 ${MAX_CONTENT_LENGTH}자까지 입력할 수 있습니다.`);
    } else if (contentError) {
      setContentError('');
    }
  };

  const handleConfirmedSubmit = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSubmitting(false);
    onSubmit(rating, content.trim());
  };

  return (
    <>
    {!isErrorOpen && !isConfirmOpen && !isSubmitting && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-[512px] bg-white rounded-2xl"
        style={{
          padding: '32px',
          boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
        }}
      >
        {/* 헤더 */}
        <h2 className="text-center text-2xl font-bold leading-8 text-[#1F2937]">
          {mode === 'edit' ? '리뷰 수정' : '리뷰 작성'}
        </h2>

        {/* 별점 영역 */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const isFilled = displayedRating >= value;
              return (
                <button
                  key={value}
                  type="button"
                  className="h-10 w-10"
                  onMouseEnter={() => setHoverRating(value)}
                  onClick={() => handleRatingChange(value)}
                  aria-label={`별점 ${value}`}
                >
                  <Image
                    src={isFilled ? '/icons/starFilledIcon.svg' : '/icons/starEmptyIcon.svg'}
                    alt=""
                    width={40}
                    height={40}
                    className="block"
                  />
                </button>
              );
            })}
            <span className="ml-3 text-2xl font-bold leading-8 text-[#FFB800]">{rating}</span>
          </div>
          {ratingError ? (
            <p className="flex items-center gap-1 text-xs text-[#DC2626]">
              <Image src="/icons/error.svg" alt="" width={12} height={12} />
              {ratingError}
            </p>
          ) : (
            <p className="text-xs text-[#4B5563]">별을 클릭하여 1점 단위로 평가할 수 있습니다.</p>
          )}
        </div>

        {/* 리뷰 내용 */}
        <div className="mt-7">
          <label className="block text-sm font-semibold text-[#1F2937]">리뷰 내용</label>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="리뷰를 작성해주세요"
            className={`mt-2 w-full h-40 rounded-[10px] border px-4 py-3 text-base outline-none placeholder:text-[rgba(26,31,46,0.5)] resize-none transition-colors ${
              isTextareaInvalid
                ? 'border-[#DC2626] focus:border-[#DC2626]'
                : 'border-[rgba(156,163,175,0.8)] focus:border-[#2F5DAA]'
            }`}
          />
          {contentError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-[#DC2626]">
              <Image src="/icons/error.svg" alt="" width={12} height={12} />
              {contentError}
            </p>
          )}
          <p className="mt-1 text-xs text-[#9CA3AF]">
            최소 10자 이상 작성해주세요. 욕설, 비방, 광고성 내용은 관리자에 의해 삭제될 수 있습니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleRegisterClick}
            disabled={isSubmitting}
            className="h-12 flex-1 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (mode === 'edit' ? '수정 중...' : '등록 중...') : (mode === 'edit' ? '수정' : '등록')}
          </button>
        </div>
      </div>

    </div>
    )}

    {/* 등록 확인 모달 (메인 모달 대체) */}
    {isConfirmOpen && !isErrorOpen && !isSubmitting && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div
          className="w-full max-w-[448px] bg-white rounded-2xl"
          style={{
            padding: '32px',
            boxShadow:
              '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 className="text-center text-2xl font-bold leading-8 text-[#1F2937]">
            {mode === 'edit' ? '리뷰 수정' : '리뷰 등록'}
          </h2>
          <p className="mt-3 text-center text-base leading-6 text-[#4B5563]">
            {mode === 'edit' ? '해당 리뷰를 수정하시겠습니까?' : '해당 리뷰를 등록하시겠습니까?'}
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirmedSubmit}
              className="h-12 flex-1 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 부적절 표현 에러 모달 (메인 모달 대체) */}
    {isErrorOpen && !isSubmitting && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div
          className="w-full max-w-[448px] bg-white rounded-2xl"
          style={{
            padding: '32px',
            boxShadow:
              '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* 빨간 느낌표 아이콘 */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(220,38,38,0.1)]">
              <Image src="/icons/error.svg" alt="" width={32} height={32} />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold leading-8 text-[#1F2937]">리뷰 작성</h2>
          <p className="mt-3 text-center text-base leading-6 text-[#4B5563]">
            부절절한 표현이 포함되어있습니다.
            <br />
            리뷰를 등록할 수 없습니다.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={handleErrorConfirm}
              className="h-12 w-full rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 등록 로딩 모달 (등록 클릭 후 표시) */}
    {isSubmitting && (
      <LoadingModal
        title={mode === 'edit' ? '리뷰 수정 중입니다' : '리뷰 등록 중입니다'}
        description="잠시만 기다려주세요...."
      />
    )}
    </>
  );
}
