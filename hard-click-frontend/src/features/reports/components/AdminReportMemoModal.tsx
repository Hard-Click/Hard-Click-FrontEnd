'use client';

interface Props {
  memo?: string;
  onClose: () => void;
}

export default function AdminReportMemoModal({ memo, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-memo-title"
        className="w-full max-w-[448px] rounded-2xl bg-white p-8 shadow-xl"
      >
        <h2
          id="report-memo-title"
          className="mb-4 text-center text-xl font-bold text-[#1F2937]"
        >
          처리 메모
        </h2>
        <p className="mb-8 text-center text-sm text-[#4B5563]">
          {memo?.trim() ? memo : '작성된 메모가 없습니다.'}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="h-12 w-full rounded-xl bg-[#2F5DAA] text-sm font-semibold text-white hover:bg-[#1D3E75]"
        >
          확인
        </button>
      </div>
    </div>
  );
}
