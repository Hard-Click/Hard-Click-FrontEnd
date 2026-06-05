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
}

export interface ReportListApiResponse {
  content: ReportApiItem[];
  totalPages: number;
}

export const mockReportList: ReportListApiResponse = {
  content: [
    {
      targetType: 'COMMENT',
      targetId: 315,
      targetContent: '이거 완전 사기 아니냐 ㅋㅋㅋ',
      authorName: '최*혁',
      reportCount: 4,
      aggregatedReasons: ['욕설 및 비하', '부적절한 언어 사용'],
      status: 'PENDING',
    },
    {
      targetType: 'POST',
      targetId: 210,
      targetContent: '외부 강의 링크 홍보 게시글입니다',
      authorName: '김*수',
      reportCount: 6,
      aggregatedReasons: ['스팸/홍보', '도배'],
      status: 'COMPLETED',
    },
  ],
  totalPages: 1,
};
