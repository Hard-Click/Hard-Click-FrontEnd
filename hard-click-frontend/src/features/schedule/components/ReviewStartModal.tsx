'use client';

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
 * "복습 시작"을 눌러도 실제 복습 퀴즈 화면이 아직 없어서(AI 개인화 스케줄러 신규 기능,
 * 백엔드 API 미확정) 준비 중 토스트만 띄우고 모달을 닫는다 — 없는 화면으로 이동하는 척 안 함(§0.5).
 * 오답/유사 문항 수 등 실데이터가 없어 안내 문구에 구체적 숫자는 넣지 않는다.
 */
export function ReviewStartModal({ onClose }: { onClose: () => void }) {
  const handleStart = () => {
    toast('복습 퀴즈는 아직 준비 중이에요.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[340px] rounded-[20px] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F1FB] text-[#185FA5]">
          {RefreshIcon}
        </div>
        <p className="mt-3.5 text-[17px] font-medium text-[#1E293B]">복습을 시작할까요?</p>
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
