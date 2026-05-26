'use client';

import Image from 'next/image';

interface SingleButtonModalProps {
  icon: string;
  iconBgColor?: string;
  title: string;
  description: string;
  subDescription?: string;
  buttonText: string;
  onClick: () => void;
}

export default function SingleButtonModal({
  icon,
  iconBgColor = '#EAF7EE',
  title,
  description,
  buttonText,
  subDescription,
  onClick,
}: SingleButtonModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[520px] rounded-[28px] bg-white px-8 py-10 shadow-xl">
        {/* icon */}
        <div className="mb-8 flex justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: iconBgColor }}
          >
            <Image src={icon} alt="modal icon" width={32} height={32} />
          </div>
        </div>

        {/* title */}
        <h2 className="mb-4 text-center text-[32px] font-bold text-[#1F2937]">
          {title}
        </h2>

        {/* description */}
        <div className="mb-10 text-center text-[#4B5563]">
          {description && <p className="text-lg">{description}</p>}

          {subDescription && <p className="mt-6 text-lg">{subDescription}</p>}
        </div>

        {/* button */}
        <button
          type="button"
          onClick={onClick}
          className="h-14 w-full rounded-xl bg-[#2F5DAA] text-xl font-semibold text-white transition hover:opacity-90"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
