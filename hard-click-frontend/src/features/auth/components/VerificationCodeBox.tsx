'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function VerificationCodeBox() {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const isFormValid = code.trim().length === 6;

  const handleVerifyCode = () => {
    if (!code.trim()) {
      setCodeError('인증코드를 입력해주세요.');
      return;
    }

    if (code.length !== 6) {
      setCodeError('인증코드가 올바르지않습니다.');
      return;
    }

    setCodeError('');
  };

  return (
    <div className="w-full max-w-[420px] rounded-[16px] bg-white px-8 py-10 shadow-sm">
      {/* icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(185,28,28,0.1)]">
          <Image
            src="/icons/security.svg"
            alt="security"
            width={32}
            height={32}
          />
        </div>
      </div>

      {/* title */}
      <h2 className="mb-3 text-center text-[28px] font-bold text-[#1F2937]">
        계정 보호 인증
      </h2>

      {/* description */}
      <p className="mb-4 text-center text-sm leading-relaxed whitespace-pre-line text-[#6B7280]">
        비밀번호 입력 오류가 5회 발생하여
        {'\n'}
        계정 보호 인증이 필요합니다.
      </p>

      {/* helper text */}
      <p className="mb-4 text-center text-xs text-[#6B7280]">
        회원가입 시 입력한 이메일로 인증코드가 발송되었습니다.
      </p>

      {/* success alert */}
      <div className="mb-5 flex items-center gap-2 rounded-xl bg-[#EAF7EE] px-4 py-3">
        <Image src="/icons/check.svg" alt="success" width={16} height={16} />

        <p className="text-sm text-[#16A34A]">
          인증코드가 이메일로 발송되었습니다
        </p>
      </div>

      {/* label */}
      <label className="mb-3 block text-sm font-semibold text-[#374151]">
        인증코드
      </label>

      {/* input */}
      <div
        className={` flex h-14 items-center rounded-2xl border px-4 ${
          codeError ? 'border-[#B91C1C]' : 'border-[#E5E7EB]'
        }`}
      >
        <input
          type="text"
          placeholder="숫자 6자리"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setCodeError('');
          }}
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* helper */}
      <p className="mt-2 text-xs text-[#6B7280]">
        인증코드는 숫자 6자리입니다.
      </p>

      {/* error */}
      <div className="mt-1 mb-1 flex h-5 items-center gap-1">
        {codeError && (
          <>
            <Image src="/icons/error.svg" alt="error" width={16} height={16} />

            <p className="text-sm text-[#B91C1C]">{codeError}</p>
          </>
        )}
      </div>

      {/* button */}
      <button
        type="button"
        onClick={handleVerifyCode}
        className={`h-12 w-full rounded-xl text-base font-semibold text-white transition ${
          isFormValid ? 'bg-[#2F5DAA] opacity-100' : 'bg-[#2F5DAA] opacity-50'
        }`}
      >
        인증 확인
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
