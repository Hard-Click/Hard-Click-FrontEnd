/**
 * 신고(관리자) 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 기준.
 * GET /api/reports (5회 이상 누적 신고 콘텐츠 목록, 관리자)
 *
 * ⚠️ 추론/주의: 노션 명세의 "response parameter 표"와 "success data example(JSON)"이
 *   서로 다르다. createdAt·reasonStats는 UI 표시용으로 추가 — 명세 확정 시 정렬 필요.
 *   - reasonStats: 사유별 누적 신고 횟수 (최근 접수순 정렬)
 *   - reportCount: 해당 콘텐츠의 총 신고 횟수 (= reasonStats 횟수 총합)
 */

export interface ReportReasonStat {
  reason: string;
  count: number;
}

export interface ReportApiItem {
  targetType: 'POST' | 'COMMENT' | 'REVIEW';
  targetId: number;
  targetContent: string;
  authorName: string;
  reporterName: string;
  reportCount: number;
  reasonStats: ReportReasonStat[];
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  isTargetDeleted: boolean;
}

export interface ReportListApiResponse {
  content: ReportApiItem[];
  totalPages: number;
}

export const mockReportList: ReportListApiResponse = {
  content: [
    {
      targetType: 'POST',
      targetId: 101,
      targetContent: 'React Hook useEffect 사용 시 무한 루프',
      authorName: '이준호',
      reporterName: '김민수',
      reportCount: 3,
      reasonStats: [
        { reason: '스팸/광고', count: 2 },
        { reason: '부적절한 언어', count: 1 },
      ],
      status: 'PENDING',
      createdAt: '2026.05.11 14:30',
      isTargetDeleted: false,
    },
    {
      targetType: 'COMMENT',
      targetId: 315,
      targetContent: '댓글 내용 - 이것은 부적절한 댓글 내용입니다.',
      authorName: '최수진',
      reporterName: '박지영',
      reportCount: 7,
      reasonStats: [
        { reason: '스팸/광고', count: 2 },
        { reason: '음란 행위', count: 3 },
        { reason: '부적절한 언어', count: 2 },
      ],
      status: 'PENDING',
      createdAt: '2026.05.10 10:20',
      isTargetDeleted: false,
    },
    {
      targetType: 'REVIEW',
      targetId: 208,
      targetContent: 'React 완벽 가이드 리뷰 - 이 강의는 별로입니다...',
      authorName: '안현',
      reporterName: '명에훼손',
      reportCount: 8,
      reasonStats: [
        { reason: '명예훼손', count: 5 },
        { reason: '욕설 및 비하', count: 3 },
      ],
      status: 'COMPLETED',
      createdAt: '2026.05.09 16:45',
      isTargetDeleted: true,
    },
    {
      targetType: 'POST',
      targetId: 210,
      targetContent:
        '프론트엔드 개발자 로드맵 - 프론트엔드 개발자가 되기 위한 로드맵을 공유합니다',
      authorName: '박지영',
      reporterName: '김철수',
      reportCount: 4,
      reasonStats: [
        { reason: '기타', count: 2 },
        { reason: '도배', count: 2 },
      ],
      status: 'REJECTED',
      createdAt: '2026.05.08 09:15',
      isTargetDeleted: false,
    },
  ],
  totalPages: 1,
};
