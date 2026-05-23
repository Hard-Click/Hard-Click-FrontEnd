import Image from 'next/image';

import EmailVerificationBox from '@/features/auth/components/EmailVerificationBox';

export default function AccountProtectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FB]">
      {/* logo */}
      <div className="mb-14 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2F5DAA] pl-1">
          <Image src="/logos/logo.svg" alt="logo" width={28} height={28} />
        </div>

        <Image
          src="/logos/sitenameBlack.svg"
          alt="sitename"
          width={120}
          height={40}
        />
      </div>

      <EmailVerificationBox
        icon="/icons/security.svg"
        iconBgColor="rgba(185, 28, 28, 0.1)"
        title="계정 보호 인증"
        description={`비밀번호 입력 오류가 5회 발생하여 
          계정 보호 인증이 필요합니다.`}
        buttonText="발급"
      />
    </div>
  );
}
