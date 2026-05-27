'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { toast } from 'sonner';

import {
  checkEmailAction,
  checkUsernameAction,
  registerAction,
  sendEmailVerificationAction,
  verifyEmailCodeAction,
} from '../actions';

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

import type { Gender, RegisterFormValues, RegisterStep } from '../types';

type StatusType = 'success' | 'warning' | 'error';

type FieldStatus = {
  type: StatusType;
  text: string;
};

type TermsModalType = 'terms' | 'privacy' | 'marketing' | null;

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

const steps = [
  { id: 1, label: '계정 정보' },
  { id: 2, label: '기본 정보' },
  { id: 3, label: '인증 및 약관' },
  { id: 4, label: '가입 완료' },
] as const;

const iconPath = {
  user: '/icons/userIcon.svg',
  mail: '/icons/mailIcon.svg',
  password: '/icons/passwordIcon.svg',
  openEye: '/icons/openEye.svg',
  closeEye: '/icons/closeEye.svg',
  check: '/icons/checkCircleIcon.svg',
  warning: '/icons/warningIcon.svg',
  error: '/icons/error.svg',
  calendar: '/icons/calendarIcon.svg',
  upload: '/icons/uploadIcon.svg',
  phone: '/icons/phoneIcon.svg',
};

const termsContent = {
  terms: {
    title: '이용약관',
    content: [
      '제1조 (목적)',
      '본 약관은 FLOWN(이하 "회사")이 제공하는 온라인 학습 플랫폼 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
      '제2조 (정의)',
      '1. "서비스"란 회사가 제공하는 온라인 학습 플랫폼 및 관련 제반 서비스를 의미합니다.',
      '2. "회원"이란 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.',
      '제3조 (약관의 게시와 개정)',
      '1. 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.',
      '2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.',
    ],
  },
  privacy: {
    title: '개인정보 활용 동의',
    content: [
      '제1조 (개인정보의 처리 목적)',
      '회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.',
      '1. 회원 가입 및 관리',
      '회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적으로 개인정보를 처리합니다.',
      '2. 재화 또는 서비스 제공',
      '서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증을 목적으로 개인정보를 처리합니다.',
      '제2조 (개인정보의 처리 및 보유 기간)',
      '회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.',
    ],
  },
  marketing: {
    title: '마케팅 정보 수신 동의',
    content: [
      '제1조 (목적)',
      '본 동의는 회사가 제공하는 이벤트, 프로모션, 신규 서비스 등의 마케팅 정보를 수신하는 것에 대한 동의입니다.',
      '제2조 (수신 정보)',
      '회원은 다음과 같은 마케팅 정보를 수신할 수 있습니다:',
      '1. 신규 강의 및 콘텐츠 안내',
      '2. 이벤트 및 프로모션 정보',
      '3. 서비스 업데이트 소식',
      '4. 맞춤형 학습 추천 정보',
      '제3조 (수신 방법)',
      '마케팅 정보는 이메일, SMS, 앱 푸시 알림 등의 방법으로 발송됩니다.',
      '제4조 (동의 철회)',
      '회원은 언제든지 마이페이지에서 마케팅 정보 수신 동의를 철회할 수 있습니다.',
    ],
  },
};

export default function RegisterForm() {
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
  const [remainingSeconds, setRemainingSeconds] = useState(300);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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
      setRemainingSeconds(300);
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
    setRemainingSeconds(300);
    // 재발송 시 이전 토큰/코드 초기화
    setValues((prev) => ({
      ...prev,
      verificationCode: '',
      emailVerificationToken: '',
    }));
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
      setFormMessage({
        type: 'error',
        text: result.message ?? '회원가입에 실패했습니다',
      });
      return;
    }

    setStep(4);
  };

  return (
    <main className="relative min-h-full bg-[#F8FAFC] font-sans text-[#1F2937]">
      {/* 토스트는 sonner Toaster가 layout.tsx에서 처리 */}
      {step !== 4 && <BrandLogo />}

      {step !== 4 ? (
        <section className="absolute left-1/2 top-[43px] h-[937.8px] w-[669px] -translate-x-1/2 rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
          <div className="absolute left-[40.64px] top-[40.64px] w-[590.72px]">
            <h1 className="text-[24px] font-bold leading-[32px] tracking-[0.07px] text-[#1F2937]">
              회원가입
            </h1>
            <p className="mt-[8px] text-[16px] leading-[24px] tracking-[-0.31px] text-[#4B5563]">
              FLOWN 수강생 계정을 만들어 학습을 시작하세요.
            </p>
          </div>

          <RegisterStepIndicator currentStep={step} />

          {formMessage && (
            <StatusText
              type={formMessage.type}
              text={formMessage.text}
              className="absolute left-[40.64px] top-[212px]"
            />
          )}

          {step === 1 && (
            <div className="absolute left-[40.64px] top-[240.62px] h-[579.91px] w-[590.72px]">
              <SectionTitle
                title="계정 정보 입력"
                description="로그인에 사용할 계정 정보를 입력해주세요."
              />

              <div className="absolute left-0 top-[67.98px] w-[590.72px]">
                <Label>아이디</Label>

                <div className="mt-[8px] flex items-start gap-[8px]">
                  <div className="w-[491.3px]">
                    <IconInput
                      inputRef={usernameRef}
                      icon={iconPath.user}
                      value={values.username}
                      onChange={(value) => updateValue('username', value)}
                      placeholder="아이디를 입력하세요"
                      width="491.3px"
                      noTopMargin
                      status={usernameStatus}
                    />

                    {usernameStatus ? (
                      <StatusText
                        type={usernameStatus.type}
                        text={usernameStatus.text}
                        className="mt-[4px]"
                      />
                    ) : (
                      <HelpText text="아이디를 입력한 뒤 중복 확인을 진행해주세요." />
                    )}
                  </div>

                  <SmallButton onClick={handleCheckUsername}>
                    중복 확인
                  </SmallButton>
                </div>
              </div>

              <div className="absolute left-0 top-[197.96px] w-[590.72px]">
                <Label>이메일</Label>

                <div className="mt-[8px] flex items-start gap-[8px]">
                  <div className="w-[270px]">
                    <IconInput
                      inputRef={emailRef}
                      icon={iconPath.mail}
                      value={values.emailId}
                      onChange={(value) => updateValue('emailId', value)}
                      placeholder="이메일 아이디"
                      width="270px"
                      noTopMargin
                      status={emailStatus}
                    />

                    {emailStatus && (
                      <StatusText
                        type={emailStatus.type}
                        text={emailStatus.text}
                        className="mt-[4px]"
                      />
                    )}
                  </div>

                  <span className="flex h-[48px] items-center text-[16px] font-medium leading-[24px] tracking-[-0.31px] text-[#1F2937]">
                    @
                  </span>

                  <div className="flex h-[48px] w-[170px] items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-white text-[16px] leading-[19px] tracking-[-0.31px] text-[#9CA3AF]">
                    gmail.com
                  </div>

                  <SmallButton onClick={handleCheckEmail}>
                    중복 확인
                  </SmallButton>
                </div>
              </div>

              <div className="absolute left-0 top-[307.95px] w-[590.72px]">
                <Label>비밀번호</Label>

                <PasswordInput
                  inputRef={passwordRef}
                  value={values.password}
                  onChange={(value) => updateValue('password', value)}
                  placeholder="비밀번호를 입력하세요"
                  show={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                  status={passwordStatus}
                />

                {passwordStatus ? (
                  <StatusText
                    type={passwordStatus.type}
                    text={passwordStatus.text}
                    className="mt-[4px]"
                  />
                ) : (
                  <HelpText text="비밀번호는 8자 이상, 16자 이하, 영문과 숫자, 특수문자(@$!%#?&)를 포함해야 합니다" />
                )}
              </div>

              <div className="absolute left-0 top-[437.93px] w-[590.72px]">
                <Label>비밀번호 확인</Label>

                <PasswordInput
                  inputRef={passwordConfirmRef}
                  value={values.passwordConfirm}
                  onChange={(value) => updateValue('passwordConfirm', value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  show={showPasswordConfirm}
                  onToggle={() => setShowPasswordConfirm((prev) => !prev)}
                  status={passwordConfirmStatus}
                />

                {passwordConfirmStatus && (
                  <StatusText
                    type={passwordConfirmStatus.type}
                    text={passwordConfirmStatus.text}
                    className="mt-[4px]"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={goNext}
                className={`absolute left-0 top-[559.91px] h-[48px] w-[590.72px] rounded-[10px] text-[16px] font-semibold leading-[24px] tracking-[-0.31px] text-white outline-none focus:outline-none focus:ring-0 ${
                  canGoStepOne ? 'bg-[#2F5DAA]' : 'bg-[#2F5DAA]/50'
                }`}
              >
                다음
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="absolute left-[43px] top-[219px] h-[648px] w-[590px]">
              <SectionTitle
                title="기본 정보 입력"
                description="수강생 프로필에 사용될 기본 정보를 입력해주세요."
              />

              <div className="absolute left-0 top-[65px] w-[590px]">
                <Label>이름</Label>
                <IconInput
                  inputRef={nameRef}
                  icon={iconPath.user}
                  value={values.name}
                  onChange={(value) => updateValue('name', value)}
                  placeholder="이름을 입력하세요"
                  width="590px"
                  status={nameStatus}
                />
                {nameStatus && (
                  <StatusText
                    type={nameStatus.type}
                    text={nameStatus.text}
                    className="mt-[4px]"
                  />
                )}
              </div>

              <div className="absolute left-0 top-[166px] w-[590px]">
                <Label>성별</Label>

                <div className="mt-[8px] flex h-[48px] gap-[12px]">
                  {[
                    ['MALE', '남성'],
                    ['FEMALE', '여성'],
                  ].map(([value, label]) => {
                    const selected = values.gender === value;
                    const hasError = genderStatus?.type === 'error';

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateValue('gender', value as Gender)}
                        className={`h-[48px] flex-1 rounded-[10px] border text-[16px] font-medium leading-[24px] tracking-[-0.31px] outline-none focus:outline-none focus:ring-0 ${
                          selected
                            ? 'border-[#2F5DAA] bg-[#2F5DAA]/5 text-[#2F5DAA]'
                            : hasError
                              ? 'border-[#B91C1C] bg-white text-[#4B5563]'
                              : 'border-[#E2E8F0] bg-white text-[#4B5563]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {genderStatus && (
                  <StatusText
                    type={genderStatus.type}
                    text={genderStatus.text}
                    className="mt-[4px]"
                  />
                )}
              </div>

              <div className="absolute left-0 top-[266px] w-[590px]">
                <Label>생년월일</Label>

                <DatePickerInput
                  inputRef={birthDateRef}
                  value={values.birthDate}
                  onChange={(value) => updateValue('birthDate', value)}
                  status={birthDateStatus}
                />

                {birthDateStatus && (
                  <StatusText
                    type={birthDateStatus.type}
                    text={birthDateStatus.text}
                    className="mt-[4px]"
                  />
                )}
              </div>

              <div className="absolute left-0 top-[365px] w-[590px]">
                <Label>전화번호</Label>

                <IconInput
                  inputRef={phoneRef}
                  icon={iconPath.phone}
                  value={values.phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="010-0000-0000"
                  width="590px"
                  status={phoneStatus}
                />

                {phoneStatus && (
                  <StatusText
                    type={phoneStatus.type}
                    text={phoneStatus.text}
                    className="mt-[4px]"
                  />
                )}
              </div>

              <div className="absolute left-0 top-[461px] h-[108px] w-[590px]">
                <Label>프로필 이미지 (선택사항)</Label>

                <div className="mt-[17px] flex h-[60px] items-center gap-[16px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB]">
                    {values.profileImagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={values.profileImagePreview}
                        alt="프로필 미리보기"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={iconPath.user}
                        alt=""
                        width={40}
                        height={40}
                      />
                    )}
                  </div>

                  <div className="h-[80px] flex-1">
                    <label className="flex h-[32px] w-[132px] cursor-pointer items-center gap-[8px] rounded-[10px] bg-[#E5E7EB] px-[14px] text-[14px] font-medium leading-[24px] tracking-[-0.31px] text-[#1F2937]">
                      <Image
                        src={iconPath.upload}
                        alt=""
                        width={16}
                        height={16}
                      />
                      이미지 업로드
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        hidden
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                      />
                    </label>

                    <p className="mt-[12px] text-[12px] leading-[16px] text-[#4B5563]">
                      jpeg, jpg, png 형식, 최대 5MB 이하 파일만 업로드할 수
                      있습니다.
                      <br />
                      업로드하지 않으면 기본 이미지가 적용됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute left-0 top-[576px] flex h-[48px] w-[590px] gap-[12px]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-[48px] flex-1 rounded-[10px] bg-[#E5E7EB] text-[16px] font-semibold leading-[24px] tracking-[-0.31px] text-[#1F2937] outline-none focus:outline-none focus:ring-0"
                >
                  이전
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className={`h-[48px] flex-1 rounded-[10px] text-[16px] font-semibold leading-[24px] tracking-[-0.31px] text-white outline-none focus:outline-none focus:ring-0 ${
                    canGoStepTwo ? 'bg-[#2F5DAA]' : 'bg-[#2F5DAA]/50'
                  }`}
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div className="absolute left-[41px] top-[231px] w-[590px]">
                <SectionTitle
                  title="약관 동의 및 이메일 인증"
                  description="서비스 이용을 위해 약관 동의와 이메일 인증을 완료해주세요."
                />
              </div>

              <div className="absolute left-[41px] top-[309px] h-[202px] w-[590px] rounded-[16px] border border-[#E2E8F0] px-[17px] pb-[1px] pt-[17px]">
                <h3 className="text-[14px] font-semibold leading-[20px] tracking-[-0.15px] text-[#1F2937]">
                  약관 동의
                </h3>

                <div className="mt-[12px] flex flex-col gap-[12px]">
                  <label className="flex h-[48px] items-center gap-[12px] rounded-[16px] bg-[#E5E7EB]/50 px-[12px]">
                    <CustomCheckbox
                      size="large"
                      checked={allTermsChecked}
                      onChange={(checked) => {
                        updateValue('agreeTerms', checked);
                        updateValue('agreePrivacy', checked);
                        updateValue('agreeMarketing', checked);
                        setTermsStatus(null);
                      }}
                    />
                    <span className="text-[16px] font-semibold leading-[24px] tracking-[-0.31px] text-[#1F2937]">
                      전체 동의
                    </span>
                  </label>

                  <div className="flex flex-col gap-[8px] pl-[16px]">
                    <AgreementRow
                      required
                      label="이용약관 동의"
                      checked={values.agreeTerms}
                      onChange={(checked) => {
                        updateValue('agreeTerms', checked);
                        setTermsStatus(null);
                      }}
                      onClickView={() => setTermsModalType('terms')}
                    />

                    <AgreementRow
                      required
                      label="개인정보 활용 동의"
                      checked={values.agreePrivacy}
                      onChange={(checked) => {
                        updateValue('agreePrivacy', checked);
                        setTermsStatus(null);
                      }}
                      onClickView={() => setTermsModalType('privacy')}
                    />

                    <AgreementRow
                      label="마케팅 정보 수신 동의"
                      checked={values.agreeMarketing}
                      onChange={(checked) =>
                        updateValue('agreeMarketing', checked)
                      }
                      onClickView={() => setTermsModalType('marketing')}
                    />
                  </div>
                </div>
              </div>

              {requiredTermsChecked && (
                <StatusText
                  type="success"
                  text={
                    allTermsChecked
                      ? '모든 약관 동의가 완료되었습니다.'
                      : '필수 약관 동의가 완료되었습니다.'
                  }
                  className="absolute left-[49px] top-[531px]"
                />
              )}

              {termsStatus && !requiredTermsChecked && (
                <StatusText
                  type={termsStatus.type}
                  text={termsStatus.text}
                  className="absolute left-[49px] top-[531px]"
                />
              )}

              <div
                className={`absolute left-[41px] top-[570px] w-[590px] rounded-[16px] border border-[#E2E8F0] ${
                  isEmailSent || isEmailVerified ? 'h-[221px]' : 'h-[145px]'
                }`}
              >
                <h3 className="absolute left-[17px] top-[11px] text-[14px] font-semibold leading-[20px] tracking-[-0.15px] text-[#1F2937]">
                  이메일 인증
                </h3>

                <p className="absolute left-[17px] top-[40px] text-[14px] leading-[20px] tracking-[-0.15px] text-[#4B5563]">
                  인증 이메일:
                </p>

                <div className="absolute left-[17px] top-[70px] flex h-[48px] w-[556px] gap-[8px]">
                  <input
                    ref={verificationEmailRef}
                    value={fullEmail}
                    readOnly
                    className={`h-[48px] flex-1 rounded-[10px] border bg-[#E5E7EB] px-[16px] text-[16px] leading-[24px] tracking-[-0.31px] text-[#4B5563] outline-none focus:outline-none focus:ring-0 ${
                      verificationStatus?.type === 'error' &&
                      !isEmailSent &&
                      !isEmailVerified
                        ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                        : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => handleSendEmailCode(false)}
                    disabled={
                      isEmailSent || isEmailVerified || isEmailSendLimitExceeded
                    }
                    className={`h-[48px] w-[119.11px] rounded-[10px] text-[16px] font-medium leading-[24px] tracking-[-0.31px] text-white outline-none focus:outline-none focus:ring-0 ${
                      isEmailSent || isEmailVerified || isEmailSendLimitExceeded
                        ? 'bg-[#2F5DAA]/50'
                        : 'bg-[#2F5DAA]'
                    }`}
                  >
                    {isEmailSent || isEmailVerified
                      ? '발송완료'
                      : '인증번호 발송'}
                  </button>
                </div>

                {isEmailSent && !isEmailVerified && (
                  <>
                    <div className="absolute left-[17px] top-[130px] flex h-[48px] w-[556px] items-center gap-[8px]">
                      <input
                        ref={verificationCodeRef}
                        value={values.verificationCode}
                        onChange={(e) =>
                          updateValue('verificationCode', e.target.value)
                        }
                        placeholder="숫자 6자리 입력"
                        maxLength={6}
                        className={`h-[48px] w-[361.68px] rounded-[10px] border bg-white px-[16px] text-[16px] leading-[19px] tracking-[-0.31px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 ${
                          verificationStatus?.type === 'error'
                            ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                            : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
                        }`}
                      />

                      <span className="w-[86.89px] text-[14px] font-medium leading-[20px] tracking-[-0.15px] text-[#B91C1C]">
                        남은 시간 {formattedRemainingTime}
                      </span>

                      <button
                        type="button"
                        onClick={handleVerifyEmailCode}
                        className="h-[48px] w-[91.43px] rounded-[10px] bg-[#E5E7EB] text-[16px] font-medium leading-[24px] tracking-[-0.31px] text-[#1F2937] outline-none focus:outline-none focus:ring-0"
                      >
                        인증 확인
                      </button>
                    </div>

                    <div className="absolute left-[17px] top-[183px] flex h-[20px] w-[361.68px] items-center justify-between">
                      <div className="min-w-0 flex-1">
                        {verificationStatus && (
                          <StatusText
                            type={verificationStatus.type}
                            text={
                              isEmailSendLimitExceeded
                                ? '1일 인증번호 발송 제한 3회를 초과했습니다.'
                                : verificationStatus.text
                            }
                          />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendEmailCode(true)}
                        disabled={isEmailSendLimitExceeded}
                        className={`ml-[12px] h-[20px] shrink-0 text-[14px] font-medium leading-[20px] tracking-[-0.15px] outline-none focus:outline-none ${
                          isEmailSendLimitExceeded
                            ? 'text-[#9CA3AF]'
                            : 'text-[#2F5DAA]'
                        }`}
                      >
                        인증번호 재발송
                      </button>
                    </div>
                  </>
                )}

                {isEmailVerified && (
                  <div className="absolute left-[17px] top-[148px] flex h-[46px] w-[556px] items-center gap-[8px] rounded-[16px] border border-[#16A34A]/20 bg-[#16A34A]/10 px-[12px]">
                    <Image
                      src={iconPath.check}
                      alt=""
                      width={20}
                      height={20}
                      className="h-[20px] w-[20px] shrink-0"
                    />

                    <span className="text-[14px] font-normal leading-[20px] tracking-[-0.15px] text-[#16A34A]">
                      이메일 인증이 완료되었습니다.
                    </span>
                  </div>
                )}

                {!isEmailSent && !isEmailVerified && verificationStatus && (
                  <StatusText
                    type={verificationStatus.type}
                    text={verificationStatus.text}
                    className="absolute left-[23px] top-[134px]"
                  />
                )}
              </div>

              <div className="absolute left-[41px] top-[795px] flex h-[48px] w-[590px] gap-[12px]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-[48px] flex-1 rounded-[10px] bg-[#E5E7EB] text-[16px] font-semibold leading-[24px] tracking-[-0.31px] text-[#1F2937] outline-none focus:outline-none focus:ring-0"
                >
                  이전
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`h-[48px] flex-1 rounded-[10px] text-[16px] font-semibold leading-[24px] tracking-[-0.31px] text-white outline-none focus:outline-none focus:ring-0 ${
                    canSubmit ? 'bg-[#2F5DAA]' : 'bg-[#2F5DAA]/50'
                  }`}
                >
                  {isSubmitting ? '처리 중...' : '회원가입 완료'}
                </button>
              </div>
            </>
          )}

          <FooterLogin />
        </section>
      ) : (
        <CompleteStep />
      )}

      {termsModalType && (
        <TermsModal
          type={termsModalType}
          onClose={() => setTermsModalType(null)}
        />
      )}
    </main>
  );
}

function getInputBorderClass(status?: FieldStatus | null) {
  if (status?.type === 'error') {
    return 'border-[#B91C1C] focus:border-[#B91C1C]';
  }

  if (status?.type === 'warning') {
    return 'border-[#F59E0B] focus:border-[#F59E0B]';
  }

  return 'border-[#E2E8F0] focus:border-[#2F5DAA]';
}

function BrandLogo() {
  return (
    <section className="absolute left-[50px] top-[38px]">
      <div className="flex h-[48px] items-center gap-[12px]">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[20px] bg-[#2F5DAA]">
          <Image
            src="/logos/logo.svg"
            alt=""
            width={28}
            height={28}
            priority
            className="h-[28px] w-[28px]"
          />
        </div>

        <Image
          src="/logos/logoblack.svg"
          alt="FLOWN"
          width={112}
          height={36}
          priority
          className="h-[36px] w-[112px]"
        />
      </div>

      <p className="mt-[25px] w-[238px] text-center text-[16px] leading-[24px] tracking-[-0.31px] text-[#4B5563]">
        학습 흐름을 관리하는 가장 쉬운 방법
      </p>
    </section>
  );
}

function CompleteStepBrandLogo() {
  return (
    <section className="absolute left-1/2 top-[88px] h-[48px] w-[166.06px] -translate-x-1/2">
      <div className="flex h-[48px] items-center gap-[12px]">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[20px] bg-[#2F5DAA]">
          <Image
            src="/logos/logo.svg"
            alt=""
            width={28}
            height={28}
            priority
            className="h-[28px] w-[28px]"
          />
        </div>

        <Image
          src="/logos/logoblack.svg"
          alt="FLOWN"
          width={112}
          height={36}
          priority
          className="h-[36px] w-[112px]"
        />
      </div>

      <p className="absolute left-1/2 top-[74px] w-[238px] -translate-x-1/2 text-center text-[16px] leading-[24px] tracking-[-0.31px] text-[#4B5563]">
        학습 흐름을 관리하는 가장 쉬운 방법
      </p>
    </section>
  );
}

function RegisterStepIndicator({ currentStep }: { currentStep: RegisterStep }) {
  return (
    <div className="absolute left-[40.64px] top-[136.63px] flex h-[63.99px] w-[590.72px] items-center justify-between">
      {steps.map((step, index) => {
        const isDone = step.id < currentStep;
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex w-[58px] flex-col items-center gap-[8px]">
              <div
                className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-[16px] font-semibold leading-[24px] tracking-[-0.31px] ${
                  isDone
                    ? 'bg-[#16A34A] text-white'
                    : isCurrent
                      ? 'bg-[#2F5DAA] text-white'
                      : 'bg-[#E2E8F0] text-[#4B5563]'
                }`}
              >
                {isDone ? '✓' : step.id}
              </div>

              <span className="whitespace-nowrap text-center text-[12px] font-medium leading-[16px] text-[#1A1F2E]">
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-[12px] h-[4px] w-[100px] rounded-full ${
                  step.id < currentStep ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="h-[52px] w-[590px]">
      <h2 className="text-[18px] font-semibold leading-[28px] tracking-[-0.44px] text-[#1F2937]">
        {title}
      </h2>
      <p className="mt-[4px] text-[14px] leading-[20px] tracking-[-0.15px] text-[#4B5563]">
        {description}
      </p>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="block text-[14px] font-medium leading-[20px] tracking-[-0.15px] text-[#1F2937]">
      {children}
    </span>
  );
}

function IconInput({
  inputRef,
  icon,
  value,
  onChange,
  placeholder,
  width,
  noTopMargin = false,
  status,
}: {
  inputRef?: RefObject<HTMLInputElement | null>;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  width: string;
  noTopMargin?: boolean;
  status?: FieldStatus | null;
}) {
  return (
    <div
      className={`relative ${noTopMargin ? '' : 'mt-[8px]'}`}
      style={{ width }}
    >
      <Image
        src={icon}
        alt=""
        width={20}
        height={20}
        className="absolute left-[16px] top-[14px]"
      />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-[48px] w-full rounded-[10px] border bg-white pl-[48px] pr-[16px] text-[16px] leading-[19px] tracking-[-0.31px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 ${getInputBorderClass(
          status,
        )}`}
      />
    </div>
  );
}

function PasswordInput({
  inputRef,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  status,
}: {
  inputRef?: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  status?: FieldStatus | null;
}) {
  const displayValue = show ? value : '*'.repeat(value.length);

  const handleChange = (nextDisplayValue: string) => {
    if (show) {
      onChange(nextDisplayValue);
      return;
    }

    if (nextDisplayValue.length < value.length) {
      onChange(value.slice(0, nextDisplayValue.length));
      return;
    }

    const addedText = nextDisplayValue.slice(value.length);
    onChange(value + addedText);
  };

  return (
    <div className="relative mt-[8px] h-[48px]">
      <Image
        src={iconPath.password}
        alt=""
        width={20}
        height={20}
        className="absolute left-[16px] top-[14px]"
      />

      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`h-[48px] w-full rounded-[10px] border bg-white pl-[48px] pr-[48px] pt-[3px] text-[16px] leading-[48px] tracking-[-0.31px] text-[#1F2937] outline-none placeholder:leading-[19px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 ${getInputBorderClass(
          status,
        )}`}
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-[16px] top-[14px] outline-none focus:outline-none focus:ring-0"
      >
        <Image
          src={show ? iconPath.closeEye : iconPath.openEye}
          alt=""
          width={20}
          height={20}
        />
      </button>
    </div>
  );
}

function DatePickerInput({
  inputRef,
  value,
  onChange,
  status,
}: {
  inputRef?: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  status?: FieldStatus | null;
}) {
  const today = new Date();
  const parsedValue = value ? new Date(value) : today;

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    Number.isNaN(parsedValue.getTime())
      ? today.getFullYear()
      : parsedValue.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    Number.isNaN(parsedValue.getTime())
      ? today.getMonth() + 1
      : parsedValue.getMonth() + 1,
  );
  // 입력 중 화면에 표시되는 문자열 (controlled input용, 빈 문자열 허용)
  const [yearInput, setYearInput] = useState(String(viewYear));
  const [monthInput, setMonthInput] = useState(String(viewMonth));

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!value) return;

    const nextDate = new Date(value);

    if (Number.isNaN(nextDate.getTime())) return;

    setViewYear(nextDate.getFullYear());
    setViewMonth(nextDate.getMonth() + 1);
  }, [value]);

  // viewYear/viewMonth 변경 시 input 문자열도 동기화 (prev/next 버튼 등 외부 변경 대응)
  useEffect(() => {
    setYearInput(String(viewYear));
  }, [viewYear]);

  useEffect(() => {
    setMonthInput(String(viewMonth));
  }, [viewMonth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
      2,
      '0',
    )}`;
  };

  const isFutureDay = (year: number, month: number, day: number) => {
    const selected = new Date(year, month - 1, day);
    selected.setHours(0, 0, 0, 0);

    const current = new Date();
    current.setHours(0, 0, 0, 0);

    return selected > current;
  };

  const selectedDateParts = value.split('-');
  const selectedYear = Number(selectedDateParts[0]);
  const selectedMonth = Number(selectedDateParts[1]);
  const selectedDay = Number(selectedDateParts[2]);

  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  const calendarCells = [
    ...Array.from({ length: firstDay }, (_, index) => ({
      type: 'empty' as const,
      key: `empty-${index}`,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      type: 'day' as const,
      key: `day-${index + 1}`,
      day: index + 1,
    })),
  ];

  const moveMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewMonth === 1) {
        setViewYear((prev) => prev - 1);
        setViewMonth(12);
        return;
      }

      setViewMonth((prev) => prev - 1);
      return;
    }

    if (viewMonth === 12) {
      setViewYear((prev) => prev + 1);
      setViewMonth(1);
      return;
    }

    setViewMonth((prev) => prev + 1);
  };

  const handleYearChange = (nextValue: string) => {
    const onlyNumber = nextValue.replace(/\D/g, '').slice(0, 4);
    setYearInput(onlyNumber);

    // 유효한 숫자일 때만 calendar 상태 업데이트
    if (onlyNumber) {
      setViewYear(Number(onlyNumber));
    }
  };

  const handleMonthChange = (nextValue: string) => {
    const onlyNumber = nextValue.replace(/\D/g, '').slice(0, 2);
    setMonthInput(onlyNumber);

    if (!onlyNumber) return;

    const nextMonth = Number(onlyNumber);

    // 13 이상은 12로 클램프
    if (nextMonth > 12) {
      setMonthInput('12');
      setViewMonth(12);
      return;
    }

    // 1~12면 그대로 반영 (0은 input엔 표시되지만 calendar는 업데이트 안 함)
    if (nextMonth >= 1) {
      setViewMonth(nextMonth);
    }
  };

  // blur 시 빈 값이거나 0이면 viewMonth/viewYear 값으로 복구
  const handleYearBlur = () => {
    if (!yearInput || Number(yearInput) < 1) {
      setYearInput(String(viewYear));
    }
  };

  const handleMonthBlur = () => {
    if (!monthInput || Number(monthInput) < 1) {
      setMonthInput(String(viewMonth));
    }
  };

  // 포커스 시 input 전체 선택 → 클릭만 해도 새 숫자 타이핑으로 교체됨
  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div ref={wrapperRef} className="relative mt-[8px] h-[48px] w-[590px]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute left-[16px] top-[14px] z-20 h-[20px] w-[20px] outline-none focus:outline-none"
      >
        <Image src={iconPath.calendar} alt="" width={20} height={20} />
      </button>

      <input
        ref={inputRef}
        value={value}
        readOnly
        onClick={() => setIsOpen(true)}
        placeholder="YYYY-MM-DD"
        className={`h-[48px] w-full cursor-pointer rounded-[10px] border bg-white pl-[48px] pr-[16px] text-[16px] leading-[19px] tracking-[-0.31px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 ${getInputBorderClass(
          status,
        )}`}
      />

      {isOpen && (
        <div className="absolute left-0 top-[56px] z-40 w-[360px] rounded-[16px] border border-[#E2E8F0] bg-white p-[16px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
          <div className="mb-[14px] flex items-center justify-between">
            <button
              type="button"
              onClick={() => moveMonth('prev')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F1F5F9] text-[18px] font-semibold text-[#4B5563] outline-none focus:outline-none"
            >
              ‹
            </button>

            <div className="flex items-center gap-[8px]">
              <div className="flex h-[36px] w-[90px] items-center rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-[10px]">
                <input
                  value={yearInput}
                  onChange={(e) => handleYearChange(e.target.value)}
                  onFocus={handleNumberInputFocus}
                  onBlur={handleYearBlur}
                  inputMode="numeric"
                  className="h-full w-full bg-transparent text-center text-[15px] font-semibold leading-[20px] text-[#1F2937] outline-none"
                />
                <span className="text-[14px] font-medium text-[#4B5563]">
                  년
                </span>
              </div>

              <div className="flex h-[36px] w-[70px] items-center rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-[10px]">
                <input
                  value={monthInput}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  onFocus={handleNumberInputFocus}
                  onBlur={handleMonthBlur}
                  inputMode="numeric"
                  className="h-full w-full bg-transparent text-center text-[15px] font-semibold leading-[20px] text-[#1F2937] outline-none"
                />
                <span className="text-[14px] font-medium text-[#4B5563]">
                  월
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => moveMonth('next')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F1F5F9] text-[18px] font-semibold text-[#4B5563] outline-none focus:outline-none"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-[6px]">
            {['일', '월', '화', '수', '목', '금', '토'].map((dayName) => (
              <div
                key={dayName}
                className="flex h-[28px] items-center justify-center text-[12px] font-semibold leading-[16px] text-[#9CA3AF]"
              >
                {dayName}
              </div>
            ))}

            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="h-[36px]" />;
              }

              const disabled = isFutureDay(viewYear, viewMonth, cell.day);
              const isSelected =
                selectedYear === viewYear &&
                selectedMonth === viewMonth &&
                selectedDay === cell.day;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(formatDate(viewYear, viewMonth, cell.day));
                    setIsOpen(false);
                  }}
                  className={`flex h-[36px] items-center justify-center rounded-[10px] text-[14px] font-medium leading-[20px] outline-none focus:outline-none ${
                    disabled
                      ? 'cursor-not-allowed text-[#CBD5E1]'
                      : isSelected
                        ? 'bg-[#2F5DAA] text-white'
                        : 'text-[#1F2937] hover:bg-[#EFF6FF] hover:text-[#2F5DAA]'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-[14px] flex items-center justify-between border-t border-[#E2E8F0] pt-[12px]">
            <button
              type="button"
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth() + 1);
              }}
              className="text-[13px] font-medium leading-[18px] text-[#4B5563] outline-none focus:outline-none"
            >
              오늘로 이동
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-[32px] rounded-[8px] bg-[#2F5DAA] px-[14px] text-[13px] font-semibold leading-[18px] text-white outline-none focus:outline-none"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SmallButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[48px] w-[91.43px] rounded-[10px] bg-[#E5E7EB]/50 text-[16px] font-medium leading-[24px] tracking-[-0.31px] text-[#1F2937] outline-none focus:outline-none focus:ring-0"
    >
      {children}
    </button>
  );
}

function HelpText({ text }: { text: string }) {
  return (
    <p className="mt-[4px] text-[12px] leading-[16px] text-[#4B5563]">{text}</p>
  );
}

function StatusText({
  type,
  text,
  className = '',
}: {
  type: StatusType;
  text: string;
  className?: string;
}) {
  const statusStyle = {
    success: {
      icon: iconPath.check,
      color: 'text-[#16A34A]',
      bgColor: 'bg-[#16A34A]',
    },
    warning: {
      icon: iconPath.warning,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]',
    },
    error: {
      icon: iconPath.error,
      color: 'text-[#B91C1C]',
      bgColor: 'bg-[#B91C1C]',
    },
  }[type];

  return (
    <p
      className={`flex h-[20px] items-center gap-[6px] text-[14px] leading-[20px] tracking-[-0.15px] ${statusStyle.color} ${className}`}
    >
      <span
        className={`block h-[16px] w-[16px] shrink-0 ${statusStyle.bgColor}`}
        style={{
          WebkitMaskImage: `url(${statusStyle.icon})`,
          maskImage: `url(${statusStyle.icon})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
      <span className="block leading-[20px]">{text}</span>
    </p>
  );
}

function CustomCheckbox({
  checked,
  onChange,
  size = 'small',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'small' | 'large';
}) {
  const boxSize = size === 'large' ? 'h-[20px] w-[20px]' : 'h-[16px] w-[16px]';
  const markSize = size === 'large' ? 'text-[14px]' : 'text-[12px]';

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex ${boxSize} shrink-0 items-center justify-center rounded-[4px] border outline-none focus:outline-none focus:ring-0 ${
        checked ? 'border-[#2F4156] bg-[#2F4156]' : 'border-[#1F2937] bg-white'
      }`}
    >
      {checked && (
        <span className={`${markSize} font-bold leading-none text-white`}>
          ✓
        </span>
      )}
    </button>
  );
}

function AgreementRow({
  label,
  required,
  checked,
  onChange,
  onClickView,
}: {
  label: string;
  required?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClickView: () => void;
}) {
  return (
    <div className="flex h-[20px] w-[540px] items-center justify-between">
      <label className="flex cursor-pointer items-center gap-[12px]">
        <CustomCheckbox checked={checked} onChange={onChange} />

        <span
          className={`text-[14px] font-medium leading-[20px] tracking-[-0.15px] ${
            required ? 'text-[#B91C1C]' : 'text-[#4B5563]'
          }`}
        >
          {required ? '[필수]' : '[선택]'}
          {label}
        </span>
      </label>

      <button
        type="button"
        onClick={onClickView}
        className="text-[14px] font-medium leading-[20px] tracking-[-0.15px] text-[#4B5563] underline outline-none focus:outline-none"
      >
        보기
      </button>
    </div>
  );
}

function FooterLogin() {
  return (
    <div className="absolute left-[40.64px] top-[866.53px] h-[44.63px] w-[590.72px] border-t border-[#E2E8F0] pt-[24.64px] text-center text-[14px] leading-[20px] tracking-[-0.15px] text-[#4B5563]">
      이미 계정이 있으신가요?{' '}
      <Link href="/auth/login" className="font-semibold text-[#2F5DAA]">
        로그인
      </Link>
    </div>
  );
}

function TermsModal({
  type,
  onClose,
}: {
  type: Exclude<TermsModalType, null>;
  onClose: () => void;
}) {
  const item = termsContent[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[590px] w-[672px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <div className="flex h-[77px] w-[672px] shrink-0 items-center justify-between border-b border-[#E2E8F0] px-[24px]">
          <h3 className="text-[20px] font-bold leading-[28px] tracking-[-0.45px] text-[#1F2937]">
            {item.title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="relative h-[24px] w-[24px] outline-none focus:outline-none"
          >
            <span className="absolute left-[6px] top-[11px] h-[2px] w-[14px] rotate-45 rounded-full bg-[#4B5563]" />
            <span className="absolute left-[6px] top-[11px] h-[2px] w-[14px] -rotate-45 rounded-full bg-[#4B5563]" />
          </button>
        </div>

        <div className="h-[416px] w-[672px] overflow-y-auto px-[24px] py-[24px]">
          <div className="flex w-[624px] flex-col gap-[16px]">
            {item.content.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className="text-[16px] font-normal leading-[24px] tracking-[-0.31px] text-[#4B5563]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="h-[97px] w-[672px] shrink-0 border-t border-[#E2E8F0] px-[24px] pt-[25px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] w-[624px] rounded-[10px] bg-[#2F5DAA] text-[16px] font-semibold leading-[24px] tracking-[-0.31px] text-white outline-none focus:outline-none"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function CompleteStep() {
  return (
    <>
      <CompleteStepBrandLogo />

      <section className="absolute left-1/2 top-[calc(50%-246px)] h-[514px] w-[773px] -translate-x-1/2 rounded-[16px] border border-[#E2E8F0] bg-white text-center shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
        <div className="absolute left-[331px] top-[96px] flex h-[80px] w-[98px] items-center justify-center rounded-full bg-[#16A34A]/10">
          <Image src={iconPath.check} alt="" width={48} height={48} />
        </div>

        <h2 className="absolute left-0 top-[241px] w-full text-center text-[24px] font-bold leading-[32px] tracking-[0.07px] text-[#1F2937]">
          회원가입이 완료되었습니다
        </h2>

        <Link
          href="/auth/login"
          className="absolute bottom-[105px] left-1/2 flex h-[48px] w-[590px] -translate-x-1/2 items-center justify-center rounded-[10px] bg-[#2F5DAA] text-[16px] font-semibold leading-[48px] tracking-[-0.31px] text-white"
        >
          로그인 페이지로 이동
        </Link>
      </section>
    </>
  );
}
