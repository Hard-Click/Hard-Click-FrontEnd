'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import PasswordInputField from './PasswordInputField';
import PasswordRuleList from './PasswordRuleList';
import PasswordValidationMessage from './PasswordValidationMessage';
import LoadingModal from '@/components/ui/loadingModal';
import SingleButtonModal from '@/components/ui/singleButtonModal';
import { changeLockedAccountPasswordAction, resetPasswordAction } from '../actions';

interface PasswordResetFormProps {
  passwordChangeToken: string;
  email?: string;
  mode?: 'account-lock' | 'forgot-password';
}

export default function PasswordResetForm({ passwordChangeToken, email, mode = 'account-lock' }: PasswordResetFormProps) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [confirmError, setConfirmError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);

  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,16}$/;

  const isPasswordValid = passwordRegex.test(password);

  const router = useRouter();

  const isPasswordMatch =
    password.length > 0 &&
    passwordConfirm.length > 0 &&
    password === passwordConfirm;

  const isFormValid = isPasswordValid && isPasswordMatch;

  const handleChangePassword = async () => {
    if (!password.trim()) {
      setPasswordError('비밀번호 조건을 다시 확인해주세요.');
      passwordRef.current?.focus();
      return;
    }

    if (!isPasswordValid) {
      setPasswordError('비밀번호 조건을 다시 확인해주세요.');
      passwordRef.current?.focus();
      return;
    }

    if (!passwordConfirm.trim()) {
      setConfirmError('비밀번호를 다시 입력해주세요.');
      confirmPasswordRef.current?.focus();
      return;
    }

    if (password !== passwordConfirm) {
      setConfirmError('비밀번호가 일치하지 않습니다.');
      confirmPasswordRef.current?.focus();
      return;
    }

    setPasswordError('');
    setConfirmError('');
    setIsLoading(true);

    const result = mode === 'forgot-password'
      ? await resetPasswordAction({
          email: email ?? '',
          passwordChangeToken,
          newPassword: password,
          newPasswordConfirm: passwordConfirm,
        })
      : await changeLockedAccountPasswordAction({
          passwordChangeToken,
          newPassword: password,
          newPasswordConfirm: passwordConfirm,
        });

    setIsLoading(false);

    if (!result.success) {
      setPasswordError(result.message ?? '비밀번호 변경에 실패했습니다.');
      passwordRef.current?.focus();
      return;
    }

    setIsSuccessModalOpen(true);
  };

  return (
    <div className="w-full max-w-[520px] rounded-[16px] bg-white px-8 py-10 shadow-sm">
      {/* icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF]">
          <Image src="/icons/lock.svg" alt="lock" width={32} height={32} />
        </div>
      </div>

      {/* title */}
      <h2 className="mb-3 text-center text-[28px] font-bold text-[#1F2937]">
        비밀번호 변경
      </h2>

      {/* description */}
      <p className="text-center text-sm text-[#4B5563]">
        임시 비밀번호로 로그인했습니다.
      </p>

      <p className="mb-6 mt-2 text-center text-sm font-medium text-[#DC2626]">
        보안을 위해 새 비밀번호로 변경해주세요.
      </p>

      {/* warning */}
      <div className="mb-8 rounded-2xl border border-[#F5B5B5] bg-[#FEF2F2] px-4 py-4">
        <p className="text-center text-sm font-medium text-[#DC2626]">
          비밀번호 변경 완료 전까지 다른 페이지로 이동할 수 없습니다
        </p>
      </div>

      {/* password */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-semibold text-[#374151]">
          새 비밀번호
        </label>

        <PasswordInputField
          value={password}
          placeholder="새 비밀번호를 입력하세요"
          showPassword={showPassword}
          isError={(!!passwordError || password.length > 0) && !isPasswordValid}
          inputRef={passwordRef}
          onChange={(value) => {
            setPassword(value);
            setPasswordError('');
          }}
          onToggleVisibility={() => setShowPassword(!showPassword)}
        />

        <PasswordRuleList />

        <PasswordValidationMessage
          show={password.length > 0 || !!passwordError}
          isValid={isPasswordValid}
        />
      </div>

      {/* confirm */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-semibold text-[#374151]">
          새 비밀번호 확인
        </label>

        <PasswordInputField
          value={passwordConfirm}
          placeholder="새 비밀번호를 다시 입력하세요"
          showPassword={showPasswordConfirm}
          isError={!!confirmError}
          inputRef={confirmPasswordRef}
          onChange={(value) => {
            setPasswordConfirm(value);
            setConfirmError('');
          }}
          onToggleVisibility={() =>
            setShowPasswordConfirm(!showPasswordConfirm)
          }
        />

        <div className="mt-2 flex min-h-[20px] items-center gap-1">
          {confirmError && (
            <>
              <Image
                src="/icons/error.svg"
                alt="error"
                width={16}
                height={16}
              />

              <p className="text-sm text-[#B91C1C]">{confirmError}</p>
            </>
          )}
        </div>
      </div>

      {/* button */}
      <button
        type="button"
        onClick={handleChangePassword}
        className={`h-12 w-full rounded-xl text-base font-semibold text-white transition ${
          isFormValid ? 'bg-[#2F5DAA] opacity-100' : 'bg-[#2F5DAA] opacity-50'
        }`}
      >
        비밀번호 변경
      </button>

      {isLoading && (
        <LoadingModal
          title="비밀번호 변경 중입니다"
          description="잠시만 기다려주세요...."
        />
      )}

      {isSuccessModalOpen && (
        <SingleButtonModal
          icon="/icons/check.svg"
          title="비밀번호 변경 완료"
          description="비밀번호가 변경되었습니다"
          buttonText="로그인하러 가기"
          onClick={() => router.push('/auth/login')}
        />
      )}
    </div>
  );
}
