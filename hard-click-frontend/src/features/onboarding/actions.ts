'use server';

import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import type { AvailabilityInput, ExamScoreInput, ProfileInput } from './types';

interface OnboardingActionResult {
  success: boolean;
  message: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  OB001: '요일 값이 올바르지 않아요.',
  OB002: '시간대 값이 올바르지 않아요.',
  OB003: '7일 전부 종일 불가능으로 설정할 수는 없어요.',
  OB004: '같은 응시영역을 중복해서 보낼 수 없어요.',
  OB005: '원점수는 0~100점 사이여야 해요.',
  OB006: '시험 날짜는 미래일 수 없어요.',
};

function toActionResult(
  res: { success: boolean; errorCode?: string; message?: string },
  fallback: string,
): OnboardingActionResult {
  if (res.success) return { success: true, message: fallback };
  return { success: false, message: (res.errorCode && ERROR_MESSAGES[res.errorCode]) || res.message || fallback };
}

/** 1단계(초기설정) 저장. mock 단계는 실호출 없이 성공만 흉내낸다. */
export async function saveProfileAction(input: ProfileInput): Promise<OnboardingActionResult> {
  if (isMock('onboarding')) return { success: true, message: '저장했어요.' };
  const res = await serverApi.put('/api/onboarding/profile', input);
  return toActionResult(res, '저장했어요.');
}

/** 2단계(불가능한 시간) 저장. mock 단계는 실호출 없이 성공만 흉내낸다. */
export async function saveAvailabilityAction(input: AvailabilityInput): Promise<OnboardingActionResult> {
  if (isMock('onboarding')) return { success: true, message: '저장했어요.' };
  const res = await serverApi.put('/api/onboarding/availability', input);
  return toActionResult(res, '저장했어요.');
}

/** 3단계(모의고사 성적) 저장. mock 단계는 실호출 없이 성공만 흉내낸다. */
export async function saveExamScoresAction(input: ExamScoreInput): Promise<OnboardingActionResult> {
  if (isMock('onboarding')) return { success: true, message: '저장했어요.' };
  const res = await serverApi.put('/api/onboarding/exam-scores', input);
  return toActionResult(res, '저장했어요.');
}
