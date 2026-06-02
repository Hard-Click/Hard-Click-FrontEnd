'use client';

import Image from 'next/image';

interface LoginErrorMessageProps {
  message?: string;
}

export default function LoginErrorMessage({ message }: LoginErrorMessageProps) {
  return (
    <div className="mt-2 min-h-[24px]">
      {message && (
        <div className="flex items-center gap-2 text-sm font-medium text-[#DC2626]">
          <Image src="/icons/error.svg" alt="error" width={18} height={18} />

          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
