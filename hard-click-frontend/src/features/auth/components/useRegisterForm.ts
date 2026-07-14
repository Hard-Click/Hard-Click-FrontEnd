'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { toast } from '@/lib/toast';

import {
  checkEmailAction,
  checkUsernameAction,
  registerAction,
  sendEmailVerificationAction,
  verifyEmailCodeAction,
} from '../actions';
import { useResendCooldown } from '@/hooks/useResendCooldown';

import {
  formatPhoneNumber,
  getEmailIdError,
  getNameError,
  getPasswordError,
  getUsernameError,
  isFutureDate,
  validatePassword,
  validateStepThree,
  validateStepTwo,
} from '../schemas';

import type { RegisterFormValues, RegisterStep } from '../types';
import type { FieldStatus, TermsModalType } from './registerForm.shared';

const initialValues: RegisterFormValues = {
  username: '',
  emailId: '',
  emailDomain: 'gmail.com',
  password: '',
  passwordConfirm: '',
  name: '',
  gender: '',
  birthDate: '',
  phoneNumber: '',
  profileImage: null,
  profileImagePreview: '',
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
  verificationCode: '',
  emailVerificationToken: '',
};

// 이메일 인증코드 유효시간(초) — BE code-ttl(180000ms = 3분)과 일치시킨다.
//   BE가 5분→3분으로 변경(2026-07-13)해 카운트다운도 맞춤. 값이 어긋나면 화면 시간이 실제와 안 맞는다.
const EMAIL_CODE_TTL_SECONDS = 180;

export function useRegisterForm() {
  const [step, setStep] = useState<RegisterStep>(1);
  const [values, setValues] = useState<RegisterFormValues>(initialValues);

  const [formMessage, setFormMessage] = useState<FieldStatus | null>(null);

  const [usernameStatus, setUsernameStatus] = useState<FieldStatus | null>(
    null,
  );
  const [emailStatus, setEmailStatus] = useState<FieldStatus | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<FieldStatus | null>(
    null,
  );
  const [passwordConfirmStatus, setPasswordConfirmStatus] =
    useState<FieldStatus | null>(null);

  const [nameStatus, setNameStatus] = useState<FieldStatus | null>(null);
  const [genderStatus, setGenderStatus] = useState<FieldStatus | null>(null);
  const [birthDateStatus, setBirthDateStatus] = useState<FieldStatus | null>(
    null,
  );
  const [phoneStatus, setPhoneStatus] = useState<FieldStatus | null>(null);

  const [termsStatus, setTermsStatus] = useState<FieldStatus | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<FieldStatus | null>(null);
  const [termsModalType, setTermsModalType] = useState<TermsModalType>(null);

  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailSendCount, setEmailSendCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    EMAIL_CODE_TTL_SECONDS,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown();

  const usernameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const passwordConfirmRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const birthDateRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const verificationEmailRef = useRef<HTMLInputElement | null>(null);
  const verificationCodeRef = useRef<HTMLInputElement | null>(null);

  const fullEmail = `${values.emailId}@gmail.com`;

  const requiredTermsChecked = values.agreeTerms && values.agreePrivacy;
  const allTermsChecked =
    values.agreeTerms && values.agreePrivacy && values.agreeMarketing;

  const isEmailSendLimitExceeded = emailSendCount >= 3;

  const canGoStepOne =
    Boolean(values.username.trim()) &&
    Boolean(values.emailId.trim()) &&
    validatePassword(values.password) &&
    values.password === values.passwordConfirm;

  const canGoStepTwo =
    Boolean(values.name.trim()) &&
    Boolean(values.gender) &&
    Boolean(values.birthDate) &&
    Boolean(values.phoneNumber.trim());

  const canSubmit = requiredTermsChecked && isEmailVerified;

  const formattedRemainingTime = `${Math.floor(remainingSeconds / 60)}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`;

  useEffect(() => {
    if (!isEmailSent || isEmailVerified) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isEmailSent, isEmailVerified]);

  const showToast = (text: string) => {
    // sonner 라이브러리 사용 (layout.tsx의 Toaster) — 에러 메시지용
    toast.error(text);
  };

  const focusInput = (ref: RefObject<HTMLInputElement | null>) => {
    window.setTimeout(() => {
      ref.current?.focus();
    }, 0);
  };

  const updateValue = <K extends keyof RegisterFormValues>(
    key: K,
    value: RegisterFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFormMessage(null);

    if (key === 'username') {
      setIsUsernameChecked(false);
      setUsernameStatus(null);
    }

    if (key === 'emailId') {
      setIsEmailChecked(false);
      setIsEmailSent(false);
      setIsEmailVerified(false);
      setEmailStatus(null);
      setVerificationStatus(null);
      setRemainingSeconds(EMAIL_CODE_TTL_SECONDS);
      setEmailSendCount(0);
    }

    if (key === 'password') {
      const nextPassword = String(value);
      const error = getPasswordError(nextPassword);

      if (!nextPassword) {
        setPasswordStatus(null);
      } else if (error) {
        setPasswordStatus({ type: 'error', text: error });
      } else {
        setPasswordStatus({
          type: 'success',
          text: '사용 가능한 비밀번호입니다',
        });
      }

      if (values.passwordConfirm) {
        setPasswordConfirmStatus(
          nextPassword === values.passwordConfirm
            ? { type: 'success', text: '비밀번호가 일치합니다' }
            : { type: 'error', text: '비밀번호가 일치하지 않습니다' },
        );
      }
    }

    if (key === 'passwordConfirm') {
      const nextConfirm = String(value);

      if (!nextConfirm) {
        setPasswordConfirmStatus(null);
      } else if (values.password === nextConfirm) {
        setPasswordConfirmStatus({
          type: 'success',
          text: '비밀번호가 일치합니다',
        });
      } else {
        setPasswordConfirmStatus({
          type: 'error',
          text: '비밀번호가 일치하지 않습니다',
        });
      }
    }

    if (key === 'name') setNameStatus(null);
    if (key === 'gender') setGenderStatus(null);
    if (key === 'birthDate') setBirthDateStatus(null);
    if (key === 'phoneNumber') setPhoneStatus(null);
    if (key === 'verificationCode') setVerificationStatus(null);
  };

  const handleCheckUsername = async () => {
    const error = getUsernameError(values.username);

    if (error) {
      setIsUsernameChecked(false);
      setUsernameStatus({ type: 'error', text: error });
      focusInput(usernameRef);
      return;
    }

    const result = await checkUsernameAction(values.username);

    if (!result.success) {
      setIsUsernameChecked(false);
      setUsernameStatus({
        type: 'warning',
        text: result.message ?? '아이디 중복 확인에 실패했습니다',
      });
      focusInput(usernameRef);
      return;
    }

    if (result.data?.exists) {
      setIsUsernameChecked(false);
      setUsernameStatus({ type: 'error', text: '이미 사용 중인 아이디입니다' });
      focusInput(usernameRef);
      return;
    }

    setIsUsernameChecked(true);
    setUsernameStatus({ type: 'success', text: '사용 가능한 아이디입니다' });
  };

  const handleCheckEmail = async () => {
    const error = getEmailIdError(values.emailId);

    if (error) {
      setIsEmailChecked(false);
      setEmailStatus({ type: 'error', text: error });
      focusInput(emailRef);
      return;
    }

    const result = await checkEmailAction({
      ...values,
      emailDomain: 'gmail.com',
    });

    if (!result.success) {
      setIsEmailChecked(false);
      setEmailStatus({
        type: 'warning',
        text: result.message ?? '이메일 중복 확인에 실패했습니다',
      });
      focusInput(emailRef);
      return;
    }

    if (result.data?.exists) {
      setIsEmailChecked(false);
      setEmailStatus({ type: 'error', text: '이미 사용 중인 이메일입니다' });
      focusInput(emailRef);
      return;
    }

    setIsEmailChecked(true);
    setEmailStatus({ type: 'success', text: '사용 가능한 이메일입니다' });
  };

  const handlePhoneChange = (value: string) => {
    updateValue('phoneNumber', formatPhoneNumber(value));
  };

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showToast('이미지 업로드에 실패했습니다');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('이미지 업로드에 실패했습니다');
      return;
    }

    updateValue('profileImage', file);
    updateValue('profileImagePreview', URL.createObjectURL(file));
  };

  const handleSendEmailCode = async (isResend = false) => {
    if (!isEmailChecked) {
      setVerificationStatus({
        type: 'error',
        text: '이메일 중복 확인을 먼저 진행해주세요',
      });
      focusInput(verificationEmailRef);
      return;
    }

    if (emailSendCount >= 3) {
      setVerificationStatus({
        type: 'error',
        text: '1일 인증번호 발송 제한 3회를 초과했습니다.',
      });
      focusInput(verificationEmailRef);
      return;
    }

    const result = await sendEmailVerificationAction({
      emailId: values.emailId,
      emailDomain: 'gmail.com',
    });

    if (!result.success) {
      setVerificationStatus({
        type: 'error',
        text: result.message ?? '인증번호 발송에 실패했습니다',
      });
      focusInput(verificationEmailRef);
      return;
    }

    setEmailSendCount((prev) => prev + 1);
    setIsEmailSent(true);
    setIsEmailVerified(false);
    setRemainingSeconds(EMAIL_CODE_TTL_SECONDS);
    // 재발송 시 이전 토큰/코드 초기화
    setValues((prev) => ({
      ...prev,
      verificationCode: '',
      emailVerificationToken: '',
    }));
    if (isResend) startCooldown();
    setVerificationStatus({
      type: 'success',
      text: isResend
        ? '인증번호가 재발송되었습니다.'
        : '인증번호가 발송되었습니다.',
    });
  };

  const handleVerifyEmailCode = async () => {
    if (!values.verificationCode.trim()) {
      setVerificationStatus({ type: 'error', text: '인증번호를 입력해주세요' });
      focusInput(verificationCodeRef);
      return;
    }

    if (!/^\d{6}$/.test(values.verificationCode.trim())) {
      setVerificationStatus({
        type: 'error',
        text: '인증번호는 숫자 6자리로 입력해주세요',
      });
      focusInput(verificationCodeRef);
      return;
    }

    if (remainingSeconds <= 0) {
      setVerificationStatus({
        type: 'error',
        text: '인증번호 유효시간이 만료되었습니다',
      });
      focusInput(verificationCodeRef);
      return;
    }

    const result = await verifyEmailCodeAction({
      emailId: values.emailId,
      emailDomain: 'gmail.com',
      verificationCode: values.verificationCode,
    });

    if (!result.success || !result.data?.emailVerificationToken) {
      setVerificationStatus({
        type: 'error',
        text: result.message ?? '인증번호가 올바르지 않습니다',
      });
      focusInput(verificationCodeRef);
      return;
    }

    // 인증 성공 → 토큰 저장 (회원가입 시 같이 보냄)
    setValues((prev) => ({
      ...prev,
      emailVerificationToken: result.data!.emailVerificationToken,
    }));
    setIsEmailVerified(true);
    setVerificationStatus({
      type: 'success',
      text: '이메일 인증이 완료되었습니다.',
    });
  };

  const goNext = () => {
    if (step === 1) {
      let hasError = false;
      let firstErrorRef: RefObject<HTMLInputElement | null> | null = null;

      const usernameError = getUsernameError(values.username);

      if (usernameError) {
        setUsernameStatus({ type: 'error', text: usernameError });
        hasError = true;
        firstErrorRef = firstErrorRef ?? usernameRef;
      } else if (!isUsernameChecked) {
        setUsernameStatus({
          type: 'warning',
          text: '아이디 중복 확인이 필요합니다',
        });
        hasError = true;
        firstErrorRef = firstErrorRef ?? usernameRef;
      }

      const emailError = getEmailIdError(values.emailId);

      if (emailError) {
        setEmailStatus({ type: 'error', text: emailError });
        hasError = true;
        firstErrorRef = firstErrorRef ?? emailRef;
      } else if (!isEmailChecked) {
        setEmailStatus({
          type: 'warning',
          text: '이메일 중복 확인이 필요합니다',
        });
        hasError = true;
        firstErrorRef = firstErrorRef ?? emailRef;
      }

      const passwordError = getPasswordError(values.password);

      if (passwordError) {
        setPasswordStatus({ type: 'error', text: passwordError });
        hasError = true;
        firstErrorRef = firstErrorRef ?? passwordRef;
      }

      if (!values.passwordConfirm) {
        setPasswordConfirmStatus({
          type: 'error',
          text: '비밀번호 확인을 입력해주세요',
        });
        hasError = true;
        firstErrorRef = firstErrorRef ?? passwordConfirmRef;
      } else if (values.password !== values.passwordConfirm) {
        setPasswordConfirmStatus({
          type: 'error',
          text: '비밀번호가 일치하지 않습니다',
        });
        hasError = true;
        firstErrorRef = firstErrorRef ?? passwordConfirmRef;
      }

      if (hasError) {
        if (firstErrorRef) focusInput(firstErrorRef);
        return;
      }

      setStep(2);
      setFormMessage(null);
      return;
    }

    if (step === 2) {
      let hasError = false;
      let firstErrorRef: RefObject<HTMLInputElement | null> | null = null;

      const nameError = getNameError(values.name);

      if (nameError) {
        setNameStatus({ type: 'error', text: nameError });
        hasError = true;
        firstErrorRef = firstErrorRef ?? nameRef;
      }

      if (!values.gender) {
        setGenderStatus({ type: 'error', text: '성별을 선택해주세요' });
        hasError = true;
      }

      if (!values.birthDate) {
        setBirthDateStatus({ type: 'error', text: '생년월일을 선택해주세요' });
        hasError = true;
        firstErrorRef = firstErrorRef ?? birthDateRef;
      } else if (isFutureDate(values.birthDate)) {
        setBirthDateStatus({
          type: 'error',
          text: '생년월일은 미래 날짜를 선택할 수 없습니다',
        });
        hasError = true;
        firstErrorRef = firstErrorRef ?? birthDateRef;
      }

      if (!values.phoneNumber.trim()) {
        setPhoneStatus({ type: 'error', text: '전화번호를 입력해주세요' });
        hasError = true;
        firstErrorRef = firstErrorRef ?? phoneRef;
      }

      const stepTwoError = validateStepTwo(values);

      if (stepTwoError && values.phoneNumber.trim()) {
        setPhoneStatus({ type: 'error', text: stepTwoError });
        hasError = true;
        firstErrorRef = firstErrorRef ?? phoneRef;
      }

      if (hasError) {
        if (firstErrorRef) focusInput(firstErrorRef);
        return;
      }

      setStep(3);
      setFormMessage(null);
    }
  };

  const handleSubmit = async () => {
    const error = validateStepThree(values, isEmailVerified);

    if (error) {
      let firstErrorRef: RefObject<HTMLInputElement | null> | null = null;

      if (!values.agreeTerms || !values.agreePrivacy) {
        setTermsStatus({ type: 'error', text: '모든 약관에 동의해주세요' });
      }

      if (!isEmailVerified) {
        setVerificationStatus({
          type: 'error',
          text: '이메일 인증을 진행해주세요',
        });
        firstErrorRef = verificationEmailRef;
      }

      if (firstErrorRef) focusInput(firstErrorRef);
      return;
    }

    setIsSubmitting(true);

    const result = await registerAction({
      ...values,
      emailDomain: 'gmail.com',
    });

    setIsSubmitting(false);

    if (!result.success) {
      // BE가 이메일 인증 토큰을 만료·무효·재사용·미인증으로 거부하면 401(ErrorCode C003)로 온다.
      //   초록 '인증 완료'를 그대로 두면 죽은 토큰으로 계속 재제출해 401만 반복되므로, 인증 서브플로우를
      //   초기 상태로 되돌려(초록 잔상 포함) "다시 인증받기"부터 새로 하게 한다. (isEmailVerified만 내리면
      //   isEmailSent가 true로 남아 RegisterStep3의 코드입력+카운트다운이 stale 값으로 되살아난다.)
      //   emailSendCount도 0으로 내린다 — 발송 상한(3회) 소진 상태에서 401을 맞으면 접힌 섹션의 발송
      //   버튼이 disabled라 재인증을 못 해 stuck되기 때문(리프레시로도 리셋되는 소프트 상한이라 안전).
      //   ⚠️ handleSubmit이 이 401을 직접 받는 건 등록이 /auth/register라 services/api.ts의
      //      401→로그인 리다이렉트 인터셉터가 '/auth' 경로를 건너뛰기 때문이다. 라우트를 /auth 밖으로
      //      옮기면 401이 여기로 안 오고 로그인으로 튕기니, 그때는 재인증 처리를 옮겨야 한다.
      //   (registerAction의 프론트 사전검증 실패는 전부 400이라, 401은 BE 토큰 케이스로만 특정된다.)
      //   메시지는 설계된 formMessage 자리·스타일을 그대로 쓰되(피드백 취지), 이 케이스의 BE 원문
      //   "인증이 필요합니다"는 회원가입 맥락에서 '로그인 요구'로 오독될 수 있어 재인증 의도를 명확히 한다.
      if (result.httpStatus === 401) {
        setIsEmailVerified(false);
        setIsEmailSent(false);
        setRemainingSeconds(EMAIL_CODE_TTL_SECONDS); // #832: 카운트다운도 TTL(3분)로 리셋
        setEmailSendCount(0);
        setVerificationStatus(null); // 초록 '인증 완료' 잔상 제거(재인증 유도)
        setValues((prev) => ({
          ...prev,
          emailVerificationToken: '',
          verificationCode: '',
        }));
        setFormMessage({
          type: 'error',
          text: '이메일 인증이 만료되었거나 유효하지 않습니다. 아래에서 다시 인증해주세요.',
        });
        return;
      }
      setFormMessage({
        type: 'error',
        text: result.message ?? '회원가입에 실패했습니다',
      });
      return;
    }

    setStep(4);
  };

  return {
    step,
    setStep,
    values,
    formMessage,
    usernameStatus,
    emailStatus,
    passwordStatus,
    passwordConfirmStatus,
    nameStatus,
    genderStatus,
    birthDateStatus,
    phoneStatus,
    termsStatus,
    setTermsStatus,
    verificationStatus,
    termsModalType,
    setTermsModalType,
    isEmailSent,
    isEmailVerified,
    isSubmitting,
    showPassword,
    setShowPassword,
    showPasswordConfirm,
    setShowPasswordConfirm,
    usernameRef,
    emailRef,
    passwordRef,
    passwordConfirmRef,
    nameRef,
    birthDateRef,
    phoneRef,
    verificationEmailRef,
    verificationCodeRef,
    cooldown,
    isCoolingDown,
    fullEmail,
    requiredTermsChecked,
    allTermsChecked,
    isEmailSendLimitExceeded,
    canGoStepOne,
    canGoStepTwo,
    canSubmit,
    formattedRemainingTime,
    updateValue,
    handleCheckUsername,
    handleCheckEmail,
    handlePhoneChange,
    handleImageUpload,
    handleSendEmailCode,
    handleVerifyEmailCode,
    goNext,
    handleSubmit,
  };
}

export type UseRegisterFormReturn = ReturnType<typeof useRegisterForm>;
