'use server';

import { revalidatePath } from 'next/cache';
import { isMock } from '@/mocks/config';
import { serverApi } from '@/lib/api';
import type { SubmitReportInput, ReportActionResult, ReportItem, AdminReportDetailApiResponse } from './types';
import { toReportItemFromDetail } from './types';

export type ReportDecision = 'REJECT' | 'DELETE';

export interface ReportDecisionInput {
  reportId: number;
  decision: ReportDecision;
  memo?: string;
  deleteTarget?: boolean;
}

/** 신고 처리 — PATCH /api/admin/reports/{reportId}/decision */
export async function processReportDecisionAction(
  input: ReportDecisionInput,
): Promise<ReportActionResult> {
  if (!Number.isInteger(input.reportId) || input.reportId <= 0) {
    return { success: false, message: '잘못된 신고입니다.' };
  }

  try {
    const res = await serverApi.patch(`/api/admin/reports/${input.reportId}/decision`, {
      decision: input.decision,
      memo: input.memo?.trim() || undefined,
      deleteTarget: input.deleteTarget ?? false,
    });

    if (!res.success) {
      return { success: false, message: res.message ?? '신고 처리에 실패했습니다.' };
    }
  } catch {
    return { success: false, message: '신고 처리 중 오류가 발생했습니다.' };
  }

  revalidatePath('/admin/reports');
  return {
    success: true,
    message: input.decision === 'REJECT' ? '신고가 반려되었습니다.' : '신고가 처리되었습니다.',
  };
}

/** 신고 상세 조회 — GET /api/admin/reports/{reportId} */
export async function fetchReportDetailAction(
  reportId: number,
  base: ReportItem,
): Promise<ReportItem> {
  try {
    const res = await serverApi.get<AdminReportDetailApiResponse>(
      `/api/admin/reports/${reportId}`,
    );
    if (res.success && res.data) {
      return toReportItemFromDetail(res.data, base);
    }
  } catch {
    // 상세 조회 실패 시 기존 base 데이터로 폴백
  }
  return base;
}

/** FE 신고 사유 → BE `reportTypes` enum (1:1 대응, ReportModal 라벨과 일치). */
const REASON_TO_ENUM: Record<string, string> = {
  '욕설/비속어': 'ABUSIVE_LANGUAGE',
  '비방/명예훼손': 'ABUSE',
  음란물: 'OBSCENE',
  '스팸/도배': 'SPAM',
  '상업적 광고': 'COMMERCIAL',
  '개인정보 노출': 'PRIVACY',
  기타: 'OTHER',
};

/**
 * 콘텐츠 신고 제출 (Server Action) — 게시글/댓글/리뷰 공용.
 * 신고자는 BE가 토큰으로 식별. `POST /api/reports` 실서버 연동.
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

  if (isMock('reports')) {
    // mock: 접수 성공 (관리자 신고 목록은 BE가 누적 집계 → GET /api/reports)
    return { success: true, message: '신고가 접수되었습니다.' };
  }

  // 한글 사유 → enum(중복 제거, 모르는 사유는 OTHER).
  const reportTypes = [
    ...new Set(input.reasons.map((r) => REASON_TO_ENUM[r] ?? 'OTHER')),
  ];
  // 추가 설명(선택)만 reason free-text로 — 사유 자체는 reportTypes(enum)가 표현
  const reason = input.detail?.trim() || undefined;

  const res = await serverApi.post<{ reportId: number }>('/api/reports', {
    targetType: input.targetType,
    targetId: input.targetId,
    reportTypes,
    reason,
  });
  if (!res.success || !res.data) {
    return {
      success: false,
      message: res.message || '신고에 실패했어요. 잠시 후 다시 시도해주세요.',
    };
  }
  return { success: true, message: '신고가 접수되었습니다.' };
}
