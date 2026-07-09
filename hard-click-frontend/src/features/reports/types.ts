export interface ReportReasonStat {
  reason: string;
  count: number;
}

export interface ReportApiItem {
  reportId: number;
  targetType: 'POST' | 'COMMENT' | 'REVIEW';
  targetId: number;
  targetTitle?: string;
  targetContentPreview?: string;
  reason?: string;
  targetAuthorId?: number;
  targetAuthorName?: string;
  reportCount: number;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  reportedAt: string;
}

export interface ReportListApiResponse {
  content: ReportApiItem[];
  totalPages: number;
}

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';
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
  reportId: number;
  targetType: ReportTarget;
  targetId: number;
  targetContent: string;
  authorName: string;
  reporterName: string;
  reportCount: number;
  reasonStats: ReportReasonStatItem[];
  status: ReportStatus;
  createdAt: string;
  isTargetDeleted: boolean;
  processMemo?: string;
  postId?: number;
  courseId?: number;
}

/** 대표 사유 = 가장 최근 접수된 사유 */
export function getLatestReason(item: ReportItem): string {
  return item.reasonStats?.[0]?.reason ?? '-';
}

export const REASON_LABEL: Record<string, string> = {
  // BE reportTypes enum (actions.ts REASON_TO_ENUM / ReportModal 기준)
  ABUSIVE_LANGUAGE: '욕설/비속어',
  COMMERCIAL: '상업적 광고',
  PRIVACY: '개인정보 노출',
  SPAM: '스팸/광고',
  OBSCENE: '음란 행위',
  ABUSE: '욕설 및 비하',
  OTHER: '기타',
  // (구) 호환 키
  DEFAMATION: '명예훼손',
  FLOOD: '도배',
  INAPPROPRIATE: '부적절한 언어',
  SLANDER: '비방',
};

/** 백엔드 응답(ReportApiItem) → UI 타입 변환 */
export function toReportItem(api: ReportApiItem): ReportItem {
  return {
    reportId: api.reportId,
    targetType: api.targetType,
    targetId: api.targetId,
    targetContent: api.targetContentPreview ?? api.targetTitle ?? '',
    authorName: api.targetAuthorName ?? '',
    reporterName: '',
    reportCount: api.reportCount,
    reasonStats: api.reason ? [{ reason: REASON_LABEL[api.reason] ?? api.reason, count: api.reportCount }] : [],
    status: api.status,
    createdAt: api.reportedAt?.replace('T', ' ').slice(0, 16) ?? '',
    isTargetDeleted: false,
  };
}

/** 신고 상세 API 응답 타입 — GET /api/admin/reports/{reportId} */
export interface AdminReportDetailApiResponse {
  reportId: number;
  targetType: string;
  targetId: number;
  targetTitle: string | null;
  targetContent: string | null;
  targetAuthorId: number | null;
  targetAuthorName: string | null;
  reportCount: number;
  reasonCounts: { reason: string; count: number }[];
  reporterId: number | null;
  reporterName: string | null;
  reporterUsername: string | null;
  status: string;
  memo: string | null;
}

/** 신고 상세 API 응답 → ReportItem 변환 */
export function toReportItemFromDetail(
  api: AdminReportDetailApiResponse,
  base: ReportItem,
): ReportItem {
  return {
    ...base,
    targetContent: api.targetContent ?? base.targetContent,
    authorName: api.targetAuthorName ?? base.authorName,
    reporterName: api.reporterName ?? base.reporterName,
    reportCount: api.reportCount,
    reasonStats: (api.reasonCounts ?? []).map((r) => ({
      reason: REASON_LABEL[r.reason] ?? r.reason,
      count: r.count,
    })),
    status: (['PENDING', 'RESOLVED', 'REJECTED'].includes(api.status)
      ? api.status
      : base.status) as ReportStatus,
    processMemo: api.memo ?? base.processMemo,
  };
}

/* ───── 신고 제출 (사용자가 게시글/댓글 신고) ───── */

export interface ReportTargetRef {
  targetType: ReportTarget;
  targetId: number;
}

export interface SubmitReportInput extends ReportTargetRef {
  reasons: string[];
  detail?: string;
}

export interface ReportActionResult {
  success: boolean;
  message: string;
}
