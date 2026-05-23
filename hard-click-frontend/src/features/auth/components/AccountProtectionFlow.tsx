'use client';

import { useState } from 'react';

import EmailVerificationBox from './EmailVerificationBox';
import VerificationCodeBox from './VerificationCodeBox';

export default function AccountProtectionFlow() {
  const [isCodeSent, setIsCodeSent] = useState(false);

  return (
    <>
      {!isCodeSent ? (
        <EmailVerificationBox
          icon="/icons/security.svg"
          iconBgColor="rgba(185, 28, 28, 0.1)"
          title="계정 보호 인증"
          description={`비밀번호 입력 오류가 5회 발생하여 
            계정 보호 인증이 필요합니다.`}
          buttonText="발급"
          onSuccess={() => setIsCodeSent(true)}
        />
      ) : (
        <VerificationCodeBox />
      )}
    </>
  );
}
