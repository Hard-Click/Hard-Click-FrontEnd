'use client';

interface ResumeWatchModalProps {
  lastPositionSeconds: number;
  onResume: () => void;
  onRestart: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}분 ${s}초`;
}

export default function ResumeWatchModal({
  lastPositionSeconds,
  onResume,
  onRestart,
}: ResumeWatchModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-[448px] h-[240px] bg-white rounded-2xl relative"
        style={{
          boxShadow:
            '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* 제목 */}
        <h2 className="absolute left-8 top-8 w-[384px] h-8 text-2xl font-bold leading-8 text-[#1F2937] text-center">
          이어보시겠습니까?
        </h2>

        {/* 설명 */}
        <p className="absolute left-8 top-[92px] w-[384px] text-base leading-6 text-[#4B5563] text-center">
          이전에 <span className="font-semibold text-[#2F5DAA]">{formatTime(lastPositionSeconds)}</span>까지 시청하셨습니다.
        </p>

        {/* 버튼 */}
        <div className="absolute left-8 top-40 w-[384px] flex gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 h-12 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
          >
            처음부터
          </button>
          <button
            type="button"
            onClick={onResume}
            className="flex-1 h-12 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
          >
            이어보기
          </button>
        </div>
      </div>
    </div>
  );
}
