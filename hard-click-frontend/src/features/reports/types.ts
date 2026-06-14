import type { ReportApiItem, ReportReasonStat } from '@/mocks/reports.mock';

export type ReportStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';
export type ReportTarget = 'POST' | 'COMMENT' | 'REVIEW';

/** 처리 상태 필터 ('ALL' = 전체) */
export type ReportStatusFilter = 'ALL' | ReportStatus;
/** 신고 대상 필터 ('ALL' = 전체) */
export type ReportTargetFilter = 'ALL' | ReportTarget;

/** 사유별 누적 신고 횟수 */
export interface ReportReasonStatItem {
  reason: string;
  count: number;
}

/** 신고 목록 UI 아이템 */
export interface ReportItem {
  targetType: ReportTarget;
  targetId: number;
  targetContent: string;
  authorName: string;
  reporterName: string;
  reportCount: number;
  /** 최근 접수순 정렬된 사유별 횟수 */
  reasonStats: ReportReasonStatItem[];
  status: ReportStatus;
  createdAt: string;
}

/** 대표 사유 = 가장 최근 접수된 사유 */
export function getLatestReason(item: ReportItem): string {
  return item.reasonStats[0]?.reason ?? '-';
}

/** 백엔드 응답(ReportApiItem) → UI 타입 변환 */
export function toReportItem(api: ReportApiItem): ReportItem {
  return {
    targetType: api.targetType,
    targetId: api.targetId,
    targetContent: api.targetContent,
    authorName: api.authorName,
    reporterName: api.reporterName,
    reportCount: api.reportCount,
    reasonStats: api.reasonStats.map((s: ReportReasonStat) => ({
      reason: s.reason,
      count: s.count,
    })),
    status: api.status,
    createdAt: api.createdAt,
  };
}
