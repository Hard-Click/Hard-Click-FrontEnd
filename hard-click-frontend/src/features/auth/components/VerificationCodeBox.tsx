'use client';

interface VerificationCodeBoxProps {
  onSuccess: () => void;
}

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const MAX_RESEND = 2; // 재발송 최대 횟수 (초기 발송 포함 총 3회)

export default function VerificationCodeBox({
  onSuccess,
}: VerificationCodeBoxProps) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const isFormValid = code.trim().length === 6;

  // 마운트 시 발송 완료 toast
  useEffect(() => {
    toast.success('인증코드가 이메일로 발송되었습니다');
  }, []);

  const handleVerifyCode = () => {
    if (!code.trim()) {
      setCodeError('인증코드를 입력해주세요.');
      return;
    }

    if (code.length !== 6) {
      setCodeError('인증코드가 올바르지않습니다.');
      return;
    }

    if (code !== '123456') {
      setCodeError('유효하지 않은 인증코드입니다.');
      return;
    }

    setCodeError('');
    onSuccess();
  };

  const handleResend = () => {
    if (resendCount >= MAX_RESEND) {
      setShowLimitModal(true);
      return;
    }
    setResendCount((prev) => prev + 1);
    toast.success('인증코드가 이메일로 재발송되었습니다');
  };

  return (
    <>
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
        <p className="mb-6 text-center text-sm leading-relaxed whitespace-pre-line text-[#6B7280]">
          비밀번호 입력 오류가 5회 발생하여{'\n'}
          계정 보호 인증이 필요합니다.
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

        {/* helper + 재발송 버튼 */}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">인증코드는 숫자 6자리입니다.</p>
          <button
            type="button"
            onClick={handleResend}
            className="text-xs font-medium text-[#2F5DAA] underline underline-offset-2"
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
          className={`mt-2 h-12 w-full rounded-xl text-base font-semibold text-white transition ${
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

      {/* 재발송 횟수 초과 모달 */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[320px] rounded-2xl bg-white px-6 py-7 shadow-xl">
            <h3 className="mb-2 text-center text-base font-bold text-[#1F2937]">
              인증번호 발급 제한
            </h3>
            <p className="mb-6 text-center text-sm leading-relaxed text-[#6B7280]">
              인증번호 발급은 하루에 최대 3회 가능합니다.{'\n'}
              내일 다시 시도해주세요.
            </p>
            <button
              type="button"
              onClick={() => setShowLimitModal(false)}
              className="h-11 w-full rounded-xl bg-[#2F5DAA] text-sm font-semibold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
