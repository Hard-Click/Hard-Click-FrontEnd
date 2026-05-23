'use client';

import Image from 'next/image';

interface PasswordInputFieldProps {
  value: string;
  placeholder: string;
  showPassword: boolean;
  isError: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}

export default function PasswordInputField({
  value,
  placeholder,
  showPassword,
  isError,
  inputRef,
  onChange,
  onToggleVisibility,
}: PasswordInputFieldProps) {
  return (
    <div
      className={`flex h-14 items-center rounded-2xl border px-4 ${
        isError ? 'border-[#B91C1C]' : 'border-[#E5E7EB]'
      }`}
    >
      <Image src="/icons/lock.svg" alt="lock" width={18} height={18} />

      <input
        ref={inputRef}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
      />

      <button type="button" onClick={onToggleVisibility}>
        <Image
          src={showPassword ? '/icons/closeEye.svg' : '/icons/openEye.svg'}
          alt="eye"
          width={20}
          height={20}
        />
      </button>
    </div>
  );
}
