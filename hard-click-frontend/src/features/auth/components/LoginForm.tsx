'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import PasswordInput from './PasswordInput';

export default function LoginForm() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log({
      loginId,
      password,
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT */}
      <section className="flex w-1/2 flex-col justify-center bg-[#2F5AAC] px-24 text-white">
        {/* logo */}
        <div className="mb-14 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Image src="/logos/logo.svg" alt="logo" width={40} height={40} />
          </div>
          <Image src="/logos/sitename.svg" alt="logo" width={150} height={80} />
        </div>

        {/* title */}
        <div className="mb-16">
          <h2 className="mb-6 text-5xl font-bold leading-tight">
            학습 흐름을 관리하는
            <br />
            가장 쉬운 방법
          </h2>

          <p className="text-xl leading-relaxed text-white/80">
            강의 수강부터 학습 기록 관리까지,
            <br />
            FLOWN에서 한 번에 관리하세요.
          </p>
        </div>

        {/* items */}
        <div className="space-y-10">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Image
                src="/icons/lectureIcon.svg"
                alt="lecture"
                width={24}
                height={24}
              />
            </div>

            <div>
              <p className="mb-1 text-xl font-semibold">체계적인 강의 수강</p>

              <p className="text-base text-white/70">
                다양한 강의를 한 곳에서 수강하고 관리
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Image
                src="/icons/timerIcon.svg"
                alt="timer"
                width={24}
                height={24}
              />
            </div>

            <div>
              <p className="mb-1 text-xl font-semibold">학습 기록 관리</p>

              <p className="text-base text-white/70">
                순공 시간과 학습 진도를 자동으로 추적
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Image
                src="/icons/grapghIcon.svg"
                alt="graph"
                width={24}
                height={24}
              />
            </div>

            <div>
              <p className="mb-1 text-xl font-semibold">학습 성과 확인</p>

              <p className="text-base text-white/70">
                시각화된 데이터로 나의 성장 확인
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section className="flex w-1/2 items-center justify-center bg-[#F5F7FB]">
        <div className="w-full max-w-[580px] rounded-3xl bg-white px-14 py-16 shadow-sm">
          <h2 className="mb-3 text-4xl font-bold text-[#1E293B]">로그인</h2>

          <p className="mb-12 text-lg text-[#64748B]">
            계정 정보를 입력하고 FLOWN을 시작하세요.
          </p>

          <form onSubmit={handleSubmit}>
            {/* ID */}
            <div className="mb-8">
              <label className="mb-3 block text-lg font-semibold text-[#1F2937]">
                아이디
              </label>

              <div className="flex h-16 items-center rounded-2xl border border-[#E2E8F0] px-5">
                <Image
                  src="/icons/mailIcon.svg"
                  alt="mail"
                  width={20}
                  height={20}
                />

                <input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="ml-4 w-full bg-transparent text-lg outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-4">
              <PasswordInput value={password} onChange={setPassword} />
            </div>

            {/* forgot */}
            <div className="mb-10 flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-[#2F5DAA]"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* submit */}
            <button
              type="submit"
              className="h-16 w-full rounded-2xl bg-[#2F5DAA] text-lg font-semibold text-white transition "
            >
              로그인
            </button>
          </form>

          {/* divider */}
          <div className="my-10 border-t border-[#E2E8F0]" />

          {/* register */}
          <div className="text-center">
            <p className="text-base text-[#4B5563]">
              아직 계정이 없으신가요?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-[#2F5DAA]"
              >
                회원가입
              </Link>
            </p>

            <p className="mt-8 text-sm text-[#4B5563]">
              강사 계정은 별도 발급됩니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
