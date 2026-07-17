'use server';

import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';

interface ChurnActionResult {
  success: boolean;
  message: string;
}

/** 타입은 런타임 보장이 없어 Server Action 경계에서 다시 검증 — 음수/실수/NaN이 그대로 BE URL에 삽입되지 않도록. */
function validateEnrollmentId(enrollmentId: number): ChurnActionResult | null {
  if (!Number.isSafeInteger(enrollmentId) || enrollmentId <= 0) {
    return { success: false, message: '유효하지 않은 수강 식별자입니다.' };
  }
  return null;
}

/**
 * 독려 알림 발송 (POST /api/admin/churn/students/{enrollmentId}/nudge, 204).
 * ⚠️ 실제 학생에게 알림이 나가는 액션 — `churn`이 mock인 동안은 실호출 없이 성공만 흉내낸다.
 */
export async function nudgeStudentAction(enrollmentId: number): Promise<ChurnActionResult> {
  const validationError = validateEnrollmentId(enrollmentId);
  if (validationError) return validationError;
  if (isMock('churn')) {
    return { success: true, message: '독려 알림을 보냈습니다.' };
  }
  const res = await serverApi.post(`/api/admin/churn/students/${enrollmentId}/nudge`);
  if (!res.success) {
    return { success: false, message: res.message ?? '독려 알림 발송에 실패했습니다.' };
  }
  return { success: true, message: '독려 알림을 보냈습니다.' };
}

/**
 * 스케줄 재조정 권유 (POST /api/admin/churn/students/{enrollmentId}/reflow, 204).
 * ⚠️ 실제 학생에게 알림이 나가는 액션 — `churn`이 mock인 동안은 실호출 없이 성공만 흉내낸다.
 */
export async function reflowStudentAction(enrollmentId: number): Promise<ChurnActionResult> {
  const validationError = validateEnrollmentId(enrollmentId);
  if (validationError) return validationError;
  if (isMock('churn')) {
    return { success: true, message: '스케줄 재조정을 권유했습니다.' };
  }
  const res = await serverApi.post(`/api/admin/churn/students/${enrollmentId}/reflow`);
  if (!res.success) {
    return { success: false, message: res.message ?? '스케줄 재조정 권유에 실패했습니다.' };
  }
  return { success: true, message: '스케줄 재조정을 권유했습니다.' };
}
