'use client';

import Image from 'next/image';

interface PasswordValidationMessageProps {
  show: boolean;
  isValid: boolean;
}

export default function PasswordValidationMessage({
  show,
  isValid,
}: PasswordValidationMessageProps) {
  if (!show) {
    return <div className="mt-3 min-h-[24px]" />;
  }

  return (
    <div className="mt-3 flex min-h-[24px] items-center gap-1">
      {isValid ? (
        <>
          <Image src="/icons/check.svg" alt="success" width={16} height={16} />

          <p className="text-sm text-[#16A34A]">
            비밀번호 조건을 충족했습니다.
          </p>
        </>
      ) : (
        <>
          <Image src="/icons/error.svg" alt="error" width={16} height={16} />

          <p className="text-sm text-[#B91C1C]">
            비밀번호 조건을 다시 확인해주세요.
          </p>
        </>
      )}
    </div>
  );
}
