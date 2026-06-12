'use client';

import Image from 'next/image';

interface ConfirmModalProps {
  icon?: string; // 선택 — 없으면 아이콘 영역 미표시
  iconBgColor?: string;
  title: string;
  description: string;
  subDescription?: string;
  cancelText: string;
  confirmText: string;
  confirmVariant?: 'primary' | 'danger'; // primary=파랑(기본) / danger=빨강(파괴적)
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  icon,
  iconBgColor,
  title,
  description,
  subDescription,
  cancelText,
  confirmText,
  confirmVariant = 'primary',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[520px] rounded-[28px] bg-white px-8 py-8 shadow-xl">
        {/* icon (선택) */}
        {icon && (
          <div className="mb-8 flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: iconBgColor }}
            >
              <Image src={icon} alt="modal icon" width={32} height={32} />
            </div>
          </div>
        )}

        {/* title */}
        <h2 className="mb-4 text-center text-[32px] font-bold text-[#1F2937]">
          {title}
        </h2>

        {/* description */}
        <p className="mb-8 whitespace-pre-line text-center text-lg leading-relaxed text-[#4B5563]">
          {description}
        </p>

        {/* buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-14 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-xl font-semibold text-[#4B5563]"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`h-14 flex-1 rounded-xl text-xl font-semibold text-white ${
              confirmVariant === 'danger' ? 'bg-[#B91C1C]' : 'bg-[#2F5DAA]'
            }`}
          >
            {confirmText}
          </button>
        </div>
        {subDescription && (
          <p className="mt-4 text-center text-sm text-[#4B5563]">
            {subDescription}
          </p>
        )}
      </div>
    </div>
  );
}
