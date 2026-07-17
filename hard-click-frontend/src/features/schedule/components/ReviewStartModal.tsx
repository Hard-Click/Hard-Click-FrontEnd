'use client';

import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';

const RefreshIcon = (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

/**
 * 오늘 할 일의 복습 항목(category REVIEW) 클릭 시 뜨는 시작 확인 모달 (#886).
 * "복습 시작" 클릭 시 courseId가 있으면 유사퀴즈(오답 기반, #888) `/quizzes/similar?courseId=`로 이동한다(#900).
 * courseId가 없으면(mock 데이터 누락 등) 없는 화면으로 이동하는 척 하지 않고 준비 중 토스트로 대체(§0.5).
 * 오답/유사 문항 수 등 실데이터가 없어 안내 문구에 구체적 숫자는 넣지 않는다.
 */
export function ReviewStartModal({ courseId, onClose }: { courseId?: number; onClose: () => void }) {
  const router = useRouter();

  const handleStart = () => {
    if (courseId == null) {
      toast('복습 퀴즈는 아직 준비 중이에요.');
      onClose();
      return;
    }
    onClose();
    router.push(`/quizzes/similar?courseId=${courseId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-start-modal-title"
        className="w-full max-w-[340px] rounded-[20px] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F1FB] text-[#185FA5]">
          {RefreshIcon}
        </div>
        <p id="review-start-modal-title" className="mt-3.5 text-[17px] font-medium text-[#1E293B]">복습을 시작할까요?</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B]">
          오답 문항과 유사 문제로 구성된 복습 퀴즈예요.
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="h-10 flex-1 rounded-[10px] bg-[#2F5DAA] text-sm font-medium text-white transition hover:bg-[#274C8B]"
          >
            복습 시작
          </button>
        </div>
      </div>
    </div>
  );
}
