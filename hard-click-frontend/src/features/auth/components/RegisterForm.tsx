'use client';

import Image from 'next/image';

import DatePickerInput from './DatePickerInput';
import RegisterStepIndicator from './RegisterStepIndicator';
import TermsModal from './TermsModal';
import { iconPath } from './registerForm.shared';
import {
  BrandLogo,
  SectionTitle,
  Label,
  IconInput,
  PasswordInput,
  SmallButton,
  HelpText,
  StatusText,
  CustomCheckbox,
  AgreementRow,
  FooterLogin,
  CompleteStep,
} from './registerForm.ui';
import { useRegisterForm } from './useRegisterForm';
import type { Gender } from '../types';

export default function RegisterForm() {
  const {
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
  } = useRegisterForm();

  return (
    <main className="relative min-h-screen bg-[#F8FAFC] font-sans text-[#1F2937]">
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
                        disabled={isEmailSendLimitExceeded || isCoolingDown}
                        className={`ml-[12px] h-[20px] shrink-0 text-[14px] font-medium leading-[20px] tracking-[-0.15px] outline-none focus:outline-none ${
                          isEmailSendLimitExceeded || isCoolingDown
                            ? 'text-[#9CA3AF]'
                            : 'text-[#2F5DAA]'
                        }`}
                      >
                        {isCoolingDown ? `재발송 (${cooldown}초)` : '인증번호 재발송'}
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
