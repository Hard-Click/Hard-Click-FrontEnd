'use client';

import { useEffect } from 'react';

// 라우트에서 발생한 에러를 잡는 Error Boundary. reset()으로 재시도. (반드시 Client Component)
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[#4B5563]">
        {error.message || '문제가 발생했습니다. 잠시 후 다시 시도해주세요.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-[#2F5DAA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#244C8F]"
      >
        다시 시도
      </button>
    </div>
  );
}
