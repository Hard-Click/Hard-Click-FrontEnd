'use client';

import { useState } from 'react';
import EmailVerificationBox from './EmailVerificationBox';
import ForgotPasswordCodeBox from './ForgotPasswordCodeBox';
import PasswordResetForm from './PasswordResetForm';

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<'email' | 'verification' | 'resetPassword'>(
    'email',
  );
  const [email, setEmail] = useState('');
  const [passwordChangeToken, setPasswordChangeToken] = useState('');

  return (
    <>
      {step === 'email' && (
        <EmailVerificationBox
          icon="/icons/key.svg"
          iconBgColor="#EEF2FF"
          title="이메일 인증"
          description={`가입한 이메일을 입력하면 비밀번호 재설정 절차를\n진행할 수 있습니다.`}
          buttonText="인증번호 발송"
          onSuccess={(submittedEmail) => {
            setEmail(submittedEmail);
            setStep('verification');
          }}
        />
      )}

      {step === 'verification' && (
        <ForgotPasswordCodeBox
          email={email}
          onSuccess={(token) => {
            setPasswordChangeToken(token);
            setStep('resetPassword');
          }}
        />
      )}

      {step === 'resetPassword' && (
        <PasswordResetForm passwordChangeToken={passwordChangeToken} />
      )}
    </>
  );
}
