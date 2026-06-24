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
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  reportedAt: string;
}

export interface ReportListApiResponse {
  content: ReportApiItem[];
  totalPages: number;
}

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
  reportId: number;
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
  isTargetDeleted: boolean;
  processMemo?: string;
  postId?: number;
  courseId?: number;
}

/** 대표 사유 = 가장 최근 접수된 사유 */
export function getLatestReason(item: ReportItem): string {
  return item.reasonStats?.[0]?.reason ?? '-';
}

const REASON_LABEL: Record<string, string> = {
  SPAM: '스팸/광고',
  OBSCENE: '음란 행위',
  ABUSE: '욕설 및 비하',
  DEFAMATION: '명예훼손',
  FLOOD: '도배',
  INAPPROPRIATE: '부적절한 언어',
  SLANDER: '비방',
  OTHER: '기타',
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

/* ───── 신고 제출 (사용자가 게시글/댓글 신고) ───── */

/** 신고 대상 (무엇을 신고하는지) */
export interface ReportTargetRef {
  targetType: ReportTarget;
  targetId: number;
}

/** 신고 제출 입력 — POST /api/reports body (신고자는 토큰으로 식별) */
export interface SubmitReportInput extends ReportTargetRef {
  reasons: string[];
  detail?: string;
}

/** 신고 제출 결과 */
export interface ReportActionResult {
  success: boolean;
  message: string;
}
