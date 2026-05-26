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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[550px] rounded-[28px] bg-white px-8 py-10 shadow-xl">
        {/* title */}
        <h2 className="mb-6 text-center  text-[36px] font-bold text-[#1F2937]">
          {title}
        </h2>

        {/* description */}
        <p className="mb-12 text-center  text-xl text-[#6B7280]">
          {description}
        </p>

        {/* buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onLeftClick}
            className="h-[60px] flex-1 rounded-2xl border border-[#D1D5DB] bg-white text-2xl font-semibold text-[#4B5563] transition hover:bg-[#F9FAFB]"
          >
            {leftText}
          </button>

          <button
            type="button"
            onClick={onRightClick}
            className="h-[60px] flex-1 rounded-2xl bg-[#3563B7] text-2xl font-semibold text-white transition hover:bg-[#274B8A]"
          >
            {rightText}
          </button>
        </div>
      </div>
    </div>
  );
}
