'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PasswordInput({ value, onChange }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="mb-3 block text-lg font-semibold text-[#1F2937]">
        비밀번호
      </label>

      <div className="flex h-16 items-center rounded-2xl border border-[#E2E8F0] px-5">
        {/* lock icon */}
        <Image
          src="/icons/passwordIcon.svg"
          alt="password"
          width={20}
          height={20}
        />

        {/* input */}
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호를 입력하세요"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ml-4 w-full bg-transparent text-lg outline-none placeholder:text-[#9CA3AF]"
        />

        {/* eye button */}
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="flex items-center justify-center"
        >
          <Image
            src={showPassword ? '/icons/openEye.svg' : '/icons/closeEye.svg'}
            alt="toggle password"
            width={22}
            height={22}
          />
        </button>
      </div>
    </div>
  );
}
