'use client';

import { toast } from '@/lib/toast';

/** 할 일 추가 버튼 (client 섬). ⚠️ BE 저장 API 없음(2026-07-15 기준) — 클릭 시 안내 토스트만 표시. */
export function AddTaskButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info('할 일 추가 기능은 준비 중이에요.')}
      className="flex items-center gap-1 rounded-lg border border-[#2F5DAA]/30 px-2.5 py-1 text-sm font-semibold text-[#2F5DAA] transition hover:bg-[#F0F5FF]"
    >
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      할 일 추가
    </button>
  );
}
