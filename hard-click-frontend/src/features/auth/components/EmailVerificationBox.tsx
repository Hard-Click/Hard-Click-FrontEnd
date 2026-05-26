'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmailAction } from '../actions';

interface EmailVerificationBoxProps {
  icon: string;
  iconBgColor: string;
  title: string;
  description: string;
  buttonText: string;
  onSuccess: (email: string) => void;
}

export default function EmailVerificationBox({
  icon,
  iconBgColor,
  title,
  description,
  buttonText,
  onSuccess,
}: EmailVerificationBoxProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isFormValid = email.trim().length > 0 && emailRegex.test(email);
  const handleSendCode = async () => {
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setEmailError('');
    setIsLoading(true);

    const result = await sendPasswordResetEmailAction(email);

    setIsLoading(false);

    if (!result.success) {
      setEmailError(result.message ?? '가입되지 않은 이메일입니다.');
      return;
    }

    onSuccess(email);
  };

  return (
    <div className="w-full max-w-[420px] rounded-[16px] bg-white px-8 py-10 shadow-sm">
      {/* icon */}
      <div className="mb-6 flex justify-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBgColor }}
        >
          <Image src={icon} alt="icon" width={32} height={32} />
        </div>
      </div>

      {/* title */}
      <h2 className="mb-3 text-center text-[28px] font-bold text-[#1F2937]">
        {title}
      </h2>

      {/* description */}
      <p className="mb-10 text-center text-sm leading-relaxed text-[#6B7280] whitespace-pre-line">
        {description}
      </p>

      {/* email label */}
      <label className="mb-3 block text-sm font-semibold text-[#374151]">
        이메일
      </label>

      {/* input */}
      <div
        className={`mb-2 flex h-14 items-center rounded-2xl border px-4 ${
          emailError ? 'border-[#B91C1C]' : 'border-[#E5E7EB]'
        }`}
      >
        <Image src="/icons/mailIcon.svg" alt="mail" width={18} height={18} />

        <input
          type="email"
          placeholder="가입한 이메일을 입력하세요"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
        />
      </div>
      <div className="mb-2 flex h-5 items-center gap-1">
        {emailError && (
          <>
            <Image src="/icons/error.svg" alt="error" width={16} height={16} />

            <p className="text-sm text-[#B91C1C]">{emailError}</p>
          </>
        )}
      </div>

      {/* button */}
      <button
        type="button"
        onClick={handleSendCode}
        disabled={isLoading}
        className={`h-12 w-full rounded-xl text-base font-semibold text-white transition ${
          isFormValid && !isLoading ? 'bg-[#2F5DAA] opacity-100' : 'bg-[#2F5DAA] opacity-50'
        }`}
      >
        {isLoading ? '발송 중...' : buttonText}
      </button>

      {/* divider */}
      <div className="mt-6 mb-6 h-px bg-[#E5E7EB]" />

      {/* back */}
      <div className="text-center">
        <Link href="/auth/login" className="text-sm font-medium text-[#2F5DAA]">
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
