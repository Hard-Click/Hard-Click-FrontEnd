import Image from 'next/image';
import AuthHeader from '@/components/common/AuthHeader';
import EmailVerificationBox from '@/features/auth/components/EmailVerificationBox';

export default function AccountProtectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FB]">
      <AuthHeader />

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
