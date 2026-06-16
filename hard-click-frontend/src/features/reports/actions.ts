'use server';

import { USE_MOCK } from '@/mocks/config';
import type { SubmitReportInput, ReportActionResult } from './types';

/**
 * 콘텐츠 신고 제출 (Server Action) — 게시글/댓글/대댓글 공용.
 * 신고자는 BE가 토큰으로 식별. mock: 접수 성공. 연동 시 POST /api/reports로 교체.
 */
export async function submitReportAction(
  input: SubmitReportInput,
): Promise<ReportActionResult> {
  // 입력 검증 (§5)
  if (!Number.isInteger(input.targetId) || input.targetId <= 0) {
    return { success: false, message: '잘못된 신고 대상입니다.' };
  }
  if (input.reasons.length === 0) {
    return { success: false, message: '신고 사유를 하나 이상 선택해주세요.' };
  }

  if (USE_MOCK) {
    // mock: 접수 성공 (관리자 신고 목록은 BE가 누적 집계 → GET /api/reports)
    return { success: true, message: '신고가 접수되었습니다.' };
  }

  // TODO(API 연동): POST /api/reports
  //   body: { targetType, targetId, reasons, detail } — 신고자는 토큰으로 식별
  return {
    success: false,
    message: '신고에 실패했어요. 잠시 후 다시 시도해주세요.',
  };
}
