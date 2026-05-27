'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import LoadingModal from '@/components/ui/loadingModal';
import SingleButtonModal from '@/components/ui/singleButtonModal';
import { sendPasswordResetEmailAction } from '../actions';

const MAX_SEND_COUNT = 3;
const LIMIT_KEY = 'forgotPasswordSendDate';
const COUNT_KEY = 'forgotPasswordSendCount';

function getTodayCount(): number {
  if (typeof window === 'undefined') return 0;
  const savedDate = localStorage.getItem(LIMIT_KEY);
  const today = new Date().toDateString();
  if (savedDate !== today) {
    localStorage.setItem(LIMIT_KEY, today);
    localStorage.setItem(COUNT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(COUNT_KEY) ?? '0', 10);
}

function incrementCount() {
  const current = getTodayCount();
  localStorage.setItem(COUNT_KEY, String(current + 1));
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const router = useRouter();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid = email.trim().length > 0 && emailRegex.test(email);

  const handleSendTempPassword = async () => {
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // 하루 3회 제한 체크
    if (getTodayCount() >= MAX_SEND_COUNT) {
      setShowLimitModal(true);
      return;
    }

    setEmailError('');
    setIsLoading(true);

    // TODO: 백엔드 연동 시 sendPasswordResetEmail(email) 호출
    setTimeout(() => {
      incrementCount();
      setIsLoading(false);
      setIsSuccessModalOpen(true);
    }, 2000);
    setEmailError('');
    setIsLoading(true);

    const result = await sendPasswordResetEmailAction(email);

    setIsLoading(false);

    if (!result.success) {
      // 404 → 가입되지 않은 이메일
      setEmailError(result.message ?? '가입되지 않은 이메일입니다. 다시 입력해주세요.');
      return;
    }

    setIsSuccessModalOpen(true);
  };

  return (
    <>
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
        <p className="mb-10 whitespace-pre-line text-center text-sm leading-relaxed text-[#6B7280]">
          가입한 이메일을 입력하면 비밀번호 재설정 절차를 {'\n'} 진행할 수
          있습니다.
        </p>

        {/* email */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-[#374151]">
            이메일
          </label>

          <div
            className={`flex h-14 items-center rounded-2xl border px-4 ${
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

          {/* error */}
          <div className="mt-2 flex min-h-[20px] items-center gap-1">
            {emailError && (
              <>
                <Image src="/icons/error.svg" alt="error" width={16} height={16} />
                <p className="text-sm text-[#B91C1C]">{emailError}</p>
              </>
            )}
          </div>
        </div>

        {/* button */}
        <button
          type="button"
          onClick={handleSendTempPassword}
          disabled={isLoading}
          className={`h-12 w-full rounded-xl text-base font-semibold text-white transition ${
            isFormValid && !isLoading ? 'bg-[#2F5DAA] opacity-100' : 'bg-[#2F5DAA] opacity-50'
          }`}
        >
          발급
        </button>

        {/* divider */}
        <div className="mb-6 mt-6 h-px bg-[#E5E7EB]" />

        {/* back */}
        <div className="text-center">
          <Link href="/auth/login" className="text-sm font-medium text-[#2F5DAA]">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>

      {/* loading */}
      {isLoading && (
        <LoadingModal
          title="임시 비밀번호 발급 중입니다"
          description="잠시만 기다려주세요...."
        />
      )}

      {/* 발급 완료 모달 */}
      {isSuccessModalOpen && (
        <SingleButtonModal
          icon="/icons/mail.svg"
          iconBgColor="#EAF7EE"
          title="임시 비밀번호 발급 완료"
          description="임시 비밀번호가 이메일로 발송되었습니다."
          subDescription="임시 비밀번호로 로그인 해주세요."
          buttonText="로그인 페이지로 이동"
          onClick={() => router.push('/auth/login')}
        />
      )}

      {/* 발급 횟수 초과 모달 */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[320px] rounded-2xl bg-white px-6 py-7 shadow-xl">
            <h3 className="mb-2 text-center text-base font-bold text-[#1F2937]">
              비밀번호 재발급 제한
            </h3>
            <p className="mb-6 text-center text-sm leading-relaxed text-[#6B7280]">
              비밀번호 재발급은 하루에 3번만 가능합니다.
              <br />
              내일 다시 시도해주세요.
            </p>
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
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
