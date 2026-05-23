'use client';

import Image from 'next/image';

interface ConfirmModalProps {
  icon: string;
  title: string;
  description: string;
  subDescription?: string;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  icon,
  title,
  description,
  subDescription,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[620px] rounded-[32px] bg-white px-10 py-12 shadow-xl">
        {/* icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#FDECEC]">
            <Image src={icon} alt="modal icon" width={48} height={48} />
          </div>
        </div>

        {/* title */}
        <h2 className="mb-6 text-center text-5xl font-bold text-[#1E293B]">
          {title}
        </h2>

        {/* description */}
        <p className="mb-12 text-center text-2xl leading-relaxed text-[#4B5563]">
          {description}
        </p>

        {/* buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-16 flex-1 rounded-2xl border border-[#E2E8F0] bg-white text-xl font-semibold text-[#475569]"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-16 flex-1 rounded-2xl bg-[#2F5DAA] text-xl font-semibold text-white"
          >
            {confirmText}
          </button>
        </div>
        {subDescription && (
          <p className="mt-6 text-center text-base text-[#64748B]">
            {subDescription}
          </p>
        )}
      </div>
    </div>
  );
}
