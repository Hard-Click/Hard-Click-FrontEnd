import type { RegisterStep } from '../types';

const steps = [
  { id: 1, label: '계정 정보' },
  { id: 2, label: '기본 정보' },
  { id: 3, label: '인증 및 약관' },
  { id: 4, label: '가입 완료' },
] as const;

export default function RegisterStepIndicator({
  currentStep,
}: {
  currentStep: RegisterStep;
}) {
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
