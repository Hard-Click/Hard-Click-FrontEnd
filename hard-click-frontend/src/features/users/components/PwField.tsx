import { forwardRef } from 'react';
import Image from 'next/image';

export type PwCheck = { type: 'success' | 'error'; text: string } | null;

interface PwFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  check: PwCheck;
}

/* ──────────────── 비밀번호 입력 + 검증 (본인확인/비번변경 공용) ──────────────── */
export const PwField = forwardRef<HTMLInputElement, PwFieldProps>(function PwField(
  { label, placeholder, value, onChange, show, onToggleShow, check },
  ref,
) {
  const borderClass =
    check?.type === 'error'
      ? 'border-[#DC2626]'
      : 'border-[#E2E8F0] focus-within:border-[#2F5DAA]';

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1F2937]">
        {label}
      </label>
      <div
        className={`flex h-12 items-center rounded-[10px] border pl-4 pr-12 transition-colors ${borderClass} relative`}
      >
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-base outline-none placeholder:text-[rgba(26,31,46,0.5)]"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label="비밀번호 표시 토글"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <Image
            src={show ? '/icons/openEye.svg' : '/icons/closeEye.svg'}
            alt=""
            width={20}
            height={20}
          />
        </button>
      </div>
      {check && (
        <p
          className={`mt-2 flex items-center gap-1 text-sm ${
            check.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'
          }`}
        >
          <Image
            src={
              check.type === 'success' ? '/icons/check.svg' : '/icons/error.svg'
            }
            alt=""
            width={16}
            height={16}
          />
          {check.text}
        </p>
      )}
    </div>
  );
});
