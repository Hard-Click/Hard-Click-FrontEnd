'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  verifyPasswordResetCodeAction,
  sendPasswordResetEmailAction,
} from '../actions';

interface ForgotPasswordCodeBoxProps {
  email: string;
  onSuccess: (passwordChangeToken: string) => void;
}

export default function ForgotPasswordCodeBox({
  email,
  onSuccess,
}: ForgotPasswordCodeBoxProps) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toastShownRef = useRef(false);
  const isFormValid = code.trim().length === 6;

  useEffect(() => {
    if (toastShownRef.current) return;
    toastShownRef.current = true;
    toast.success('인증번호가 발송되었습니다.');
  }, []);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setCodeError('인증코드를 입력해주세요.');
      return;
    }

    if (code.length !== 6) {
      setCodeError('인증코드가 올바르지 않습니다.');
      return;
    }

    setCodeError('');
    setIsLoading(true);

    const result = await verifyPasswordResetCodeAction(email, code);

    setIsLoading(false);

    if (!result.success) {
      setCodeError(result.message ?? '유효하지 않은 인증코드입니다.');
      return;
    }

    const token = (result as { data?: { passwordChangeToken?: string } }).data
      ?.passwordChangeToken;

    if (!token) {
      setCodeError('유효하지 않은 인증코드입니다.');
      return;
    }

    onSuccess(token);
  };

  const handleResend = async () => {
    const result = await sendPasswordResetEmailAction(email);
    if (!result.success) {
      toast.error(result.message || '재발송에 실패했습니다.');
      return;
    }
    toast.success('인증번호가 재발송되었습니다.');
  };

  return (
    <div className="w-full max-w-[420px] rounded-[16px] bg-white px-8 py-10 shadow-sm">
      {/* icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF]">
          <Image src="/icons/key.svg" alt="key" width={32} height={32} />
        </div>
      </div>

      {/* title */}
      <h2 className="mb-3 text-center text-[28px] font-bold text-[#1F2937]">
        이메일 인증
      </h2>

      {/* description */}
      <p className="mb-6 text-center text-sm leading-relaxed whitespace-pre-line text-[#6B7280]">
        이메일로 발송된 인증번호를 입력해주세요.
      </p>

      {/* label */}
      <label className="mb-3 block text-sm font-semibold text-[#374151]">
        인증코드
      </label>

      {/* input */}
      <div
        className={`flex h-14 items-center rounded-2xl border px-4 ${
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

      {/* helper + 재발송 */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-[#6B7280]">인증코드는 숫자 6자리입니다.</p>
        <button
          type="button"
          onClick={handleResend}
          className="text-xs font-medium text-[#2F5DAA]"
        >
          인증번호 재발송
        </button>
      </div>

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
        disabled={isLoading}
        className={`mt-2 h-12 w-full rounded-xl text-base font-semibold text-white transition ${
          isFormValid && !isLoading
            ? 'bg-[#2F5DAA] opacity-100'
            : 'bg-[#2F5DAA] opacity-50'
        }`}
      >
        {isLoading ? '확인 중...' : '인증 확인'}
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
