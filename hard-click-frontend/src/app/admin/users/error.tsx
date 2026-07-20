'use client';

/** 사용자 관리(/admin/users) 전용 에러 경계 — 관리자 헤더/네비는 유지한 채 이 영역만 대체한다. */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
      <h2 className="text-xl font-bold text-[#1E293B]">
        사용자 목록을 불러오지 못했습니다.
      </h2>
      <p className="text-sm text-[#64748B]">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={reset}
        className="h-11 rounded-[10px] bg-[#2F5DAA] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1D3E75]"
      >
        다시 시도
      </button>
    </div>
  );
}
