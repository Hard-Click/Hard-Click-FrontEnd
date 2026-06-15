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
  processMemo?: string;
  postId?: number;
  courseId?: number;
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
      postId: 101,
    },
    {
      targetType: 'REVIEW',
      targetId: 150,
      targetContent: 'React 완벽 가이드 리뷰 - 이 강의는 별로입니다...',
      authorName: '안현',
      reporterName: '명에훼손',
      reportCount: 8,
      reasonStats: [
        { reason: '명예훼손', count: 5 },
        { reason: '욕설 및 비하', count: 3 },
      ],
      status: 'PENDING',
      createdAt: '2026.05.09 16:45',
      isTargetDeleted: false,
      postId: 101,
      courseId: 1,
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
      processMemo: '신고 사유가 불충분하여 반려 처리했습니다.',
      postId: 101,
    },
    {
      targetType: 'POST',
      targetId: 211,
      targetContent: '광고성 게시글 - 지금 가입하면 100% 할인! 링크 클릭',
      authorName: '스팸유저',
      reporterName: '이준호',
      reportCount: 6,
      reasonStats: [{ reason: '스팸/광고', count: 6 }],
      status: 'PENDING',
      createdAt: '2026.05.07 18:40',
      isTargetDeleted: false,
    },
    {
      targetType: 'COMMENT',
      targetId: 320,
      targetContent: '댓글 - 이런 글 왜 쓰는지 모르겠네요 수준 낮다',
      authorName: '김유저',
      reporterName: '최수진',
      reportCount: 5,
      reasonStats: [
        { reason: '부적절한 언어', count: 3 },
        { reason: '비방', count: 2 },
      ],
      status: 'PENDING',
      createdAt: '2026.05.07 11:05',
      isTargetDeleted: false,
      postId: 210,
    },
    {
      targetType: 'REVIEW',
      targetId: 151,
      targetContent: 'TypeScript 심화 리뷰 - 환불해주세요 사기강의',
      authorName: '불만족',
      reporterName: '이강사',
      reportCount: 3,
      reasonStats: [{ reason: '명예훼손', count: 3 }],
      status: 'PENDING',
      createdAt: '2026.05.06 15:20',
      isTargetDeleted: false,
      courseId: 2,
    },
    {
      targetType: 'POST',
      targetId: 212,
      targetContent: '도배성 게시글 - ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ',
      authorName: '도배러',
      reporterName: '박지영',
      reportCount: 8,
      reasonStats: [{ reason: '도배', count: 8 }],
      status: 'COMPLETED',
      createdAt: '2026.05.06 09:00',
      isTargetDeleted: true,
      processMemo: '도배 게시글로 확인되어 삭제 처리했습니다.',
    },
    {
      targetType: 'COMMENT',
      targetId: 321,
      targetContent: '댓글 - 외부 사이트 홍보 링크입니다 www.spam.com',
      authorName: '홍보봇',
      reporterName: '김민수',
      reportCount: 7,
      reasonStats: [{ reason: '스팸/광고', count: 7 }],
      status: 'PENDING',
      createdAt: '2026.05.05 20:30',
      isTargetDeleted: false,
      postId: 210,
    },
    {
      targetType: 'POST',
      targetId: 213,
      targetContent: '부적절한 게시글 - 욕설이 포함된 내용입니다',
      authorName: '화난유저',
      reporterName: '최수진',
      reportCount: 4,
      reasonStats: [{ reason: '부적절한 언어', count: 4 }],
      status: 'PENDING',
      createdAt: '2026.05.05 13:12',
      isTargetDeleted: false,
    },
    {
      targetType: 'REVIEW',
      targetId: 152,
      targetContent: 'Node.js 리뷰 - 강사 실력이 의심됩니다',
      authorName: '수강생A',
      reporterName: '박강사',
      reportCount: 3,
      reasonStats: [{ reason: '명예훼손', count: 3 }],
      status: 'REJECTED',
      createdAt: '2026.05.04 10:00',
      isTargetDeleted: false,
      processMemo: '정당한 후기로 판단되어 반려했습니다.',
      courseId: 3,
    },
    {
      targetType: 'COMMENT',
      targetId: 322,
      targetContent: '댓글 - 의미 없는 반복 댓글 도배',
      authorName: '반복러',
      reporterName: '이준호',
      reportCount: 5,
      reasonStats: [{ reason: '도배', count: 5 }],
      status: 'PENDING',
      createdAt: '2026.05.03 16:45',
      isTargetDeleted: false,
      postId: 101,
    },
  ],
  totalPages: 2,
};
