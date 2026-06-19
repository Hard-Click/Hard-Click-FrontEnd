'use client';

interface DoubleBtnModalProps {
  title: string;
  description: string;
  leftText: string;
  rightText: string;
  onLeftClick: () => void;
  onRightClick: () => void;
}

export default function DoubleBtnModal({
  title,
  description,
  leftText,
  rightText,
  onLeftClick,
  onRightClick,
}: DoubleBtnModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[400px] rounded-3xl bg-white px-8 py-8 shadow-xl">
        {/* title */}
        <h2 className="mb-3 text-center text-2xl font-bold text-[#1F2937]">
          {title}
        </h2>

        {/* description */}
        <p className="mb-6 text-center text-base text-[#6B7280]">
          {description}
        </p>

        {/* buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLeftClick}
            className="h-10 flex-1 rounded-[12px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
          >
            {leftText}
          </button>

          <button
            type="button"
            onClick={onRightClick}
            className="h-10 flex-1 rounded-[12px] bg-[#3563B7] text-base font-semibold text-white transition hover:bg-[#274B8A]"
          >
            {rightText}
          </button>
        </div>
      </div>
    </div>
  );
}
