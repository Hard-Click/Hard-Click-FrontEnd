/**
 * 신고(관리자) 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 기준.
 * GET /api/reports (5회 이상 누적 신고 콘텐츠 목록, 관리자)
 *
 * ⚠️ 추론/주의: 노션 명세의 "response parameter 표"와 "success data example(JSON)"이
 *   서로 다르다. 여기서는 가장 구체적인 success example(JSON)의 shape을 따랐다.
 *   - 표에만 있고 예시엔 없음: reportId, mainReason, reporterName, createdAt
 *   - 예시에만 있고 표엔 없음: targetId, authorName
 *   백엔드 실제 응답 확정 시 이 둘 중 하나로 정렬 필요.
 */

export interface ReportApiItem {
  targetType: 'POST' | 'COMMENT' | 'REVIEW';
  targetId: number;
  targetContent: string;
  authorName: string;
  reportCount: number;
  aggregatedReasons: string[];
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
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
      reportCount: 3,
      aggregatedReasons: ['스팸/광고'],
      status: 'PENDING',
      createdAt: '2026.05.11 14:30',
    },
    {
      targetType: 'COMMENT',
      targetId: 315,
      targetContent: '댓글 내용 - 이것은 부적절한 댓글 내용입니다.',
      authorName: '최수진',
      reportCount: 5,
      aggregatedReasons: ['욕설 및 비하'],
      status: 'PENDING',
      createdAt: '2026.05.10 10:20',
    },
    {
      targetType: 'REVIEW',
      targetId: 208,
      targetContent: 'React 완벽 가이드 리뷰 - 이 강의는 별로입니다...',
      authorName: '안현',
      reportCount: 8,
      aggregatedReasons: ['명예훼손'],
      status: 'COMPLETED',
      createdAt: '2026.05.09 16:45',
    },
    {
      targetType: 'POST',
      targetId: 210,
      targetContent:
        '프론트엔드 개발자 로드맵 - 프론트엔드 개발자가 되기 위한 로드맵을 공유합니다',
      authorName: '박지영',
      reportCount: 4,
      aggregatedReasons: ['기타'],
      status: 'REJECTED',
      createdAt: '2026.05.08 09:15',
    },
  ],
  totalPages: 1,
};
