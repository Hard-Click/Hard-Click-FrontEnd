'use client';

import Image from 'next/image';

import { SectionTitle, StatusText, CustomCheckbox, AgreementRow } from './registerForm.ui';
import { iconPath } from './registerForm.shared';
import type { UseRegisterFormReturn } from './useRegisterForm';

export function RegisterStep3({
  values,
  updateValue,
  termsStatus,
  setTermsStatus,
  verificationStatus,
  setTermsModalType,
  isEmailSent,
  isEmailVerified,
  isSubmitting,
  verificationEmailRef,
  verificationCodeRef,
  cooldown,
  isCoolingDown,
  fullEmail,
  requiredTermsChecked,
  allTermsChecked,
  isEmailSendLimitExceeded,
  canSubmit,
  formattedRemainingTime,
  setStep,
  handleSendEmailCode,
  handleVerifyEmailCode,
  handleSubmit,
}: UseRegisterFormReturn) {
  return (
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
            className="absolute left-[23px] top-[123px]"
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
  );
}
