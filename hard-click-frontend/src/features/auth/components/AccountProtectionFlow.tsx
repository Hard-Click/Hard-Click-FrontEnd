'use client';

import { useState } from 'react';

import EmailVerificationBox from './EmailVerificationBox';
import VerificationCodeBox from './VerificationCodeBox';
import PasswordResetForm from './PasswordResetForm';

export default function AccountProtectionFlow() {
  const [step, setStep] = useState<'email' | 'verification' | 'resetPassword'>(
    'email'
  );

  // const [step, setStep] = useState<'email' | 'verification' | 'resetPassword'>(
  //   'resetPassword'
  // );

  return (
    <>
      {step === 'email' && (
        <EmailVerificationBox
          icon="/icons/security.svg"
          iconBgColor="rgba(185, 28, 28, 0.1)"
          title="계정 보호 인증"
          description={`비밀번호 입력 오류가 5회 발생하여 
            계정 보호 인증이 필요합니다.`}
          buttonText="발급"
          onSuccess={() => setStep('verification')}
        />
      )}

      {step === 'verification' && (
        <VerificationCodeBox onSuccess={() => setStep('resetPassword')} />
      )}

      {step === 'resetPassword' && <PasswordResetForm />}
    </>
  );
}
