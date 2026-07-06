'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const isAuthError =
    error.message?.includes('인증') || error.message?.includes('401') || error.message?.includes('Unauthorized');

  useEffect(() => {
    console.error(error);
    // error.digest가 있으면 서버에서 onRequestError로 이미 캡처됨 → 중복 방지
    if (!error.digest) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[#4B5563]">
        {error.message || '문제가 발생했습니다. 잠시 후 다시 시도해주세요.'}
      </p>
      {isAuthError ? (
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="rounded-xl bg-[#2F5DAA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#244C8F]"
        >
          로그인하기
        </button>
      ) : (
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-[#2F5DAA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#244C8F]"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
