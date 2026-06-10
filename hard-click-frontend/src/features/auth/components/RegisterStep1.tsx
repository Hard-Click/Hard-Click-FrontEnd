'use client';

import {
  SectionTitle,
  Label,
  IconInput,
  PasswordInput,
  SmallButton,
  HelpText,
  StatusText,
} from './registerForm.ui';
import { iconPath } from './registerForm.shared';
import type { UseRegisterFormReturn } from './useRegisterForm';

export function RegisterStep1({
  values,
  updateValue,
  usernameStatus,
  emailStatus,
  passwordStatus,
  passwordConfirmStatus,
  usernameRef,
  emailRef,
  passwordRef,
  passwordConfirmRef,
  showPassword,
  setShowPassword,
  showPasswordConfirm,
  setShowPasswordConfirm,
  handleCheckUsername,
  handleCheckEmail,
  canGoStepOne,
  goNext,
}: UseRegisterFormReturn) {
  return (
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
  );
}
