'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-xl font-bold text-[#1F2937]">
          마이페이지를 불러오지 못했습니다.
        </h2>
        <p className="text-sm text-[#4B5563]">잠시 후 다시 시도해주세요.</p>
        <button
          type="button"
          onClick={reset}
          className="px-6 h-11 bg-[#2F5DAA] hover:bg-[#1D3E75] rounded-[10px] text-base font-semibold text-white transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
