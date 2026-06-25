/**
 * 알림 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/notifications
 *
 * 실제로는 백엔드가 "로그인 사용자가 받을 알림"만 필터링해서 내려준다.
 * mock 단계에서는 그 결과를 흉내 내기 위해 역할(STUDENT/INSTRUCTOR/ADMIN)별로
 * 다른 목록을 둔다. (실연동 시 이 역할 분기는 사라지고 단일 응답만 사용)
 */

export interface NotificationApiItem {
  notiId: number;
  type: string; // BE enum(라이브): NOTICE · POST_COMMENT · COMMENT_REPLY · COMMENT_ACCEPTED · COURSE_REGISTER · REPORT
  message: string;
  isRead: boolean;
  /** BE 제공 — 클릭 시 이동 경로 (실서버는 이 값 사용). 라이브 검증(2026-06-25). */
  redirectUrl?: string;
  /** mock 전용 — 타겟 데이터 ID (BE는 redirectUrl을 직접 주므로 실연동에선 미사용). */
  referenceId?: number;
  createdAt: string;
}

export interface NotificationListApiResponse {
  content: NotificationApiItem[];
  hasNext?: boolean;
}

/**
 * mock 표시용 상대시간 — 지금 기준 n분 전 ISO 문자열.
 * "방금 전 / N분 전 / N시간 전 / N일 전" 라벨을 실제로 확인하기 위해 동적으로 생성한다.
 */
function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString();
}

/** 학생: 전체 공지 / 강의 공지 / 댓글 / 채택 / 채팅 */
const studentNotifications: NotificationApiItem[] = [
  {
    notiId: 109,
    type: 'POST_COMMENT',
    message: '내 질문 「useEffect 무한 루프 문제」에 새로운 댓글이 달렸습니다.',
    isRead: false,
    referenceId: 889,
    createdAt: minutesAgo(3),
  },
  {
    notiId: 108,
    type: 'COMMENT_ACCEPTED',
    message: '작성하신 답변이 채택되었습니다.',
    isRead: false,
    referenceId: 887,
    createdAt: minutesAgo(28),
  },
  {
    notiId: 107,
    type: 'NOTICE',
    message: '수강 중인 「수능 국어 독서」 강의에 새 공지가 등록되었습니다.',
    isRead: false,
    referenceId: 1,
    createdAt: minutesAgo(95),
  },
  {
    notiId: 106,
    type: 'NOTICE',
    message: '[공지] 서버 점검 안내가 등록되었습니다.',
    isRead: false,
    referenceId: 1,
    createdAt: minutesAgo(60 * 4),
  },
  {
    notiId: 105,
    type: 'POST_COMMENT',
    message: '내 게시글 「수능 공부 팁 공유합니다」에 새로운 댓글이 달렸습니다.',
    isRead: true,
    referenceId: 888,
    createdAt: minutesAgo(60 * 9),
  },
  {
    notiId: 104,
    type: 'POST_COMMENT',
    message: '스터디 채팅방에 새로운 메시지가 도착했습니다.',
    isRead: true,
    referenceId: 0,
    createdAt: minutesAgo(60 * 20),
  },
  {
    notiId: 103,
    type: 'NOTICE',
    message: '새로운 강의 업데이트 공지가 등록되었습니다.',
    isRead: true,
    referenceId: 3,
    createdAt: minutesAgo(60 * 24),
  },
  {
    notiId: 102,
    type: 'COMMENT_ACCEPTED',
    message: '작성하신 답변이 채택되었습니다.',
    isRead: true,
    referenceId: 886,
    createdAt: minutesAgo(60 * 24 * 2),
  },
  {
    notiId: 101,
    type: 'NOTICE',
    message: '수강 중인 「수능 수학 미적분」 강의에 새 공지가 등록되었습니다.',
    isRead: true,
    referenceId: 2,
    createdAt: minutesAgo(60 * 24 * 4),
  },
];

/** 강사: 관리자가 올리는 전체 공지 */
const instructorNotifications: NotificationApiItem[] = [
  {
    notiId: 209,
    type: 'NOTICE',
    message: '[공지] 강사 정산 일정 안내가 등록되었습니다.',
    isRead: false,
    referenceId: 2,
    createdAt: minutesAgo(50),
  },
  {
    notiId: 208,
    type: 'NOTICE',
    message: '[공지] 강의 업로드 가이드라인이 변경되었습니다.',
    isRead: false,
    referenceId: 3,
    createdAt: minutesAgo(60 * 26),
  },
  {
    notiId: 207,
    type: 'NOTICE',
    message: '[공지] 서버 점검 안내가 등록되었습니다.',
    isRead: true,
    referenceId: 1,
    createdAt: minutesAgo(60 * 24 * 3),
  },
];

/** 관리자: 신고 / 강사 강좌 등록 / 강사 공지 등록 */
const adminNotifications: NotificationApiItem[] = [
  {
    notiId: 309,
    type: 'REPORT',
    message: '게시글 「React Hook useEffect…」이(가) 신고되었습니다.',
    isRead: false,
    referenceId: 889,
    createdAt: minutesAgo(12),
  },
  {
    notiId: 308,
    type: 'COURSE_REGISTER',
    message: '강사 「김지수」님이 새 강좌 「수능 영어 독해」를 등록했습니다.',
    isRead: false,
    referenceId: 51,
    createdAt: minutesAgo(75),
  },
  {
    notiId: 307,
    type: 'NOTICE',
    message: '강사 「박민호」님이 강의 공지를 등록했습니다.',
    isRead: false,
    referenceId: 2,
    createdAt: minutesAgo(60 * 5),
  },
  {
    notiId: 306,
    type: 'REPORT',
    message: '댓글이 신고되었습니다. 내용을 확인해주세요.',
    isRead: true,
    referenceId: 888,
    createdAt: minutesAgo(60 * 24),
  },
];

/** 역할별 알림 응답 (mock 전용 분기) */
export const mockNotificationsByRole: Record<string, NotificationListApiResponse> = {
  STUDENT: { content: studentNotifications },
  INSTRUCTOR: { content: instructorNotifications },
  ADMIN: { content: adminNotifications },
};
