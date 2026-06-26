'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * 브라우저 history 뒤로가기 leaf 버튼.
 * Server Component 페이지에서 '뒤로가기'만 client로 분리할 때 사용한다.
 */
export default function BackButton({
  className,
  ariaLabel = '뒤로가기',
  children,
}: {
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}
