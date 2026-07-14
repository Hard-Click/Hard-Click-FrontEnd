'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ScheduleSetupForm } from './ScheduleSetupForm';
import { AvailabilityGrid } from './AvailabilityGrid';

type Step = 'form' | 'availability';

/**
 * 학습 스케줄 초기 설정 흐름(client 섬) — 목표/선택과목 입력 → 불가능한 시간 체크.
 * 모의고사 성적 입력 화면은 별도 이슈/PR에서 이어붙일 예정(#855 다음 단계).
 */
export function ScheduleSetupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');

  if (step === 'availability') {
    return <AvailabilityGrid onSubmit={() => router.push('/schedule')} />;
  }
  return <ScheduleSetupForm onNext={() => setStep('availability')} />;
}
