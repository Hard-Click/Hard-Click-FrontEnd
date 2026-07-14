'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ScheduleSetupForm } from './ScheduleSetupForm';
import { AvailabilityGrid } from './AvailabilityGrid';
import { ExamScoreForm } from './ExamScoreForm';

type Step = 'form' | 'availability' | 'examScore';

/** 학습 스케줄 초기 설정 3단계 흐름(client 섬) — 목표/선택과목 → 불가능한 시간 체크 → 모의고사 성적. */
export function ScheduleSetupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');

  if (step === 'examScore') {
    return <ExamScoreForm onSubmit={() => router.push('/schedule')} />;
  }
  if (step === 'availability') {
    return <AvailabilityGrid onNext={() => setStep('examScore')} />;
  }
  return <ScheduleSetupForm onNext={() => setStep('availability')} />;
}
