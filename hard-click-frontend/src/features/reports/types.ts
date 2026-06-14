import type { ReportApiItem } from '@/mocks/reports.mock';

export type ReportStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';
export type ReportTarget = 'POST' | 'COMMENT' | 'REVIEW';

/** 처리 상태 필터 ('ALL' = 전체) */
export type ReportStatusFilter = 'ALL' | ReportStatus;
/** 신고 대상 필터 ('ALL' = 전체) */
export type ReportTargetFilter = 'ALL' | ReportTarget;

/** 신고 목록 UI 아이템 */
export interface ReportItem {
  targetType: ReportTarget;
  targetId: number;
  targetContent: string;
  authorName: string;
  reportCount: number;
  reasons: string[];
  status: ReportStatus;
  createdAt: string;
}

/** 백엔드 응답(ReportApiItem) → UI 타입 변환 */
export function toReportItem(api: ReportApiItem): ReportItem {
  return {
    targetType: api.targetType,
    targetId: api.targetId,
    targetContent: api.targetContent,
    authorName: api.authorName,
    reportCount: api.reportCount,
    reasons: api.aggregatedReasons,
    status: api.status,
    createdAt: api.createdAt,
  };
}
