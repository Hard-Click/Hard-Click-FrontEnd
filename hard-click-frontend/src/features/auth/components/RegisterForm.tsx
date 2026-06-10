'use client';

import RegisterStepIndicator from './RegisterStepIndicator';
import TermsModal from './TermsModal';
import {
  BrandLogo,
  StatusText,
  FooterLogin,
  CompleteStep,
} from './registerForm.ui';
import { RegisterStep1 } from './RegisterStep1';
import { RegisterStep2 } from './RegisterStep2';
import { RegisterStep3 } from './RegisterStep3';
import { useRegisterForm } from './useRegisterForm';

export default function RegisterForm() {
  const form = useRegisterForm();

  return (
    <main className="relative min-h-screen bg-[#F8FAFC] font-sans text-[#1F2937]">
      {/* 토스트는 sonner Toaster가 layout.tsx에서 처리 */}
      {form.step !== 4 && <BrandLogo />}

      {form.step !== 4 ? (
        <section className="absolute left-1/2 top-[43px] h-[937.8px] w-[669px] -translate-x-1/2 rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
          <div className="absolute left-[40.64px] top-[40.64px] w-[590.72px]">
            <h1 className="text-[24px] font-bold leading-[32px] tracking-[0.07px] text-[#1F2937]">
              회원가입
            </h1>
            <p className="mt-[8px] text-[16px] leading-[24px] tracking-[-0.31px] text-[#4B5563]">
              FLOWN 수강생 계정을 만들어 학습을 시작하세요.
            </p>
          </div>

          <RegisterStepIndicator currentStep={form.step} />

          {form.formMessage && (
            <StatusText
              type={form.formMessage.type}
              text={form.formMessage.text}
              className="absolute left-[40.64px] top-[212px]"
            />
          )}

          {form.step === 1 && <RegisterStep1 {...form} />}
          {form.step === 2 && <RegisterStep2 {...form} />}
          {form.step === 3 && <RegisterStep3 {...form} />}

          <FooterLogin />
        </section>
      ) : (
        <CompleteStep />
      )}

      {form.termsModalType && (
        <TermsModal
          type={form.termsModalType}
          onClose={() => form.setTermsModalType(null)}
        />
      )}
    </main>
  );
}
