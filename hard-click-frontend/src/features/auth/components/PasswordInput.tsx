'use client';

import Image from 'next/image';
import { forwardRef, useState } from 'react';

import LoginErrorMessage from './LoginErrorMessage';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showErrorBorder?: boolean;
  name?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value, onChange, error, showErrorBorder, name }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div>
        <label className="mb-3 block text-lg font-semibold text-[#1F2937]">
          비밀번호
        </label>

        <div
          className={`flex h-16 items-center rounded-2xl border px-5 transition-colors ${
            showErrorBorder ? 'border-[#B91C1C]' : 'border-[#E2E8F0]'
          }`}
        >
          <Image
            src="/icons/passwordIcon.svg"
            alt="password"
            width={20}
            height={20}
          />

          <input
            ref={ref}
            name={name}
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력하세요"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="ml-4 w-full bg-transparent text-lg outline-none placeholder:text-[#9CA3AF]"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="flex items-center justify-center"
          >
            <Image
              src={showPassword ? '/icons/openEye.svg' : '/icons/closeEye.svg'}
              alt="toggle password"
              width={28}
              height={28}
            />
          </button>
        </div>

        <LoginErrorMessage message={error} />
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
