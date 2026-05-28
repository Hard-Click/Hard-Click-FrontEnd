'use client';

interface TimerInfoModalProps {
  mode: 'start' | 'end';
  onCancel: () => void;
  onConfirm: () => void;
}

const PRESET = {
  start: {
    title: '타이머 시작',
    description: '순공 시간을 측정하시겠습니까?',
  },
  end: {
    title: '타이머 종료',
    description: '순공 시간 측정을 종료하시겠습니까?',
  },
};

export default function TimerInfoModal({ mode, onCancel, onConfirm }: TimerInfoModalProps) {
  const preset = PRESET[mode];
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
          {preset.title}
        </h2>

        {/* 설명 */}
        <p className="absolute left-8 top-[92px] w-[384px] text-base leading-6 text-[#4B5563] text-center">
          {preset.description}
        </p>

        {/* 버튼 — 취소 / 확인 */}
        <div className="absolute left-8 top-40 w-[384px] flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-12 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
