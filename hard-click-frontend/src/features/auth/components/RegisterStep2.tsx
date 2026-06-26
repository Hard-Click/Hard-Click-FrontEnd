'use client';

import Image from 'next/image';

import DatePickerInput from './DatePickerInput';
import { SectionTitle, Label, IconInput, StatusText } from './registerForm.ui';
import { iconPath } from './registerForm.shared';
import type { Gender } from '../types';
import type { UseRegisterFormReturn } from './useRegisterForm';

export function RegisterStep2({
  values,
  updateValue,
  nameStatus,
  genderStatus,
  birthDateStatus,
  phoneStatus,
  nameRef,
  birthDateRef,
  phoneRef,
  handlePhoneChange,
  handleImageUpload,
  setStep,
  canGoStepTwo,
  goNext,
}: UseRegisterFormReturn) {
  return (
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
  );
}
