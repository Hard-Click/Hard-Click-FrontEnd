import type { NotificationApiItem } from '@/mocks/notifications.mock';

/**
 * 알림 종류 — BE NotificationItemResponse.type enum과 1:1 (라이브 검증 2026-06-25).
 * "어떤 알림을 받을지"는 백엔드가 사용자별로 필터링해 내려주므로, 프론트는 각 종류의
 * 표시 메타(아이콘/라벨/구분)만 갖추면 된다. (이동 경로는 BE redirectUrl을 그대로 사용)
 */
export type NotificationType =
  | 'NOTICE' // 전체 공지
  | 'POST_COMMENT' // 내 게시글에 댓글
  | 'COMMENT_REPLY' // 내 댓글에 답글(대댓글)
  | 'COMMENT_ACCEPTED' // 답변 채택
  | 'COURSE_REGISTER' // 강좌 등록 (관리자)
  | 'REPORT'; // 신고 접수 (관리자)

/** 알림 구분 — 드롭다운 상단 필터 탭 단위 (여러 종류를 묶는다) */
export type NotificationCategory =
  | 'notice' // 공지류 (전체 공지 / 강의 공지 / 공지 등록)
  | 'community' // 커뮤니티 (댓글 / 채택)
  | 'chat' // 채팅
  | 'report' // 신고
  | 'course'; // 강좌 등록

/** 알림 대상 역할 — mock에서 역할별 목록을 고르기 위함 (실연동에선 BE가 사용자별 필터링) */
export type NotificationRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

/** UI에서 사용하는 알림 항목 (백엔드 shape → 이 타입으로 변환해 사용) */
export interface NotificationItem {
  notiId: number;
  type: NotificationType;
  category: NotificationCategory;
  message: string;
  isRead: boolean;
  /** 클릭 시 이동할 경로 (type + referenceId 기반으로 계산) */
  href: string;
  createdAt: string;
}

/** 종류별 표시 메타 — 라벨 + 아이콘(SVG asset) + 아이콘 배경색 */
export const NOTI_META: Record<
  NotificationType,
  { label: string; icon: string; iconBg: string }
> = {
  NOTICE: { label: '공지', icon: '/icons/notice.svg', iconBg: '#FFF7ED' },
  POST_COMMENT: {
    label: '댓글',
    icon: '/icons/commuComment.svg',
    iconBg: '#EFF6FF',
  },
  COMMENT_REPLY: {
    label: '답글',
    icon: '/icons/commuComment.svg',
    iconBg: '#EFF6FF',
  },
  COMMENT_ACCEPTED: {
    label: '채택',
    icon: '/icons/checkCircleIcon.svg',
    iconBg: '#F0FDF4',
  },
  COURSE_REGISTER: {
    label: '강좌 등록',
    icon: '/icons/bookIcon.svg',
    iconBg: '#EFF6FF',
  },
  REPORT: { label: '신고', icon: '/icons/reportFlagIcon.svg', iconBg: '#FEF2F2' },
};

/** 종류 → 구분 */
const TYPE_CATEGORY: Record<NotificationType, NotificationCategory> = {
  NOTICE: 'notice',
  POST_COMMENT: 'community',
  COMMENT_REPLY: 'community',
  COMMENT_ACCEPTED: 'community',
  COURSE_REGISTER: 'course',
  REPORT: 'report',
};

/** 필터 탭 표시 순서 */
export const CATEGORY_ORDER: NotificationCategory[] = [
  'notice',
  'community',
  'chat',
  'report',
  'course',
];

/** 필터 탭 라벨 */
export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  notice: '공지',
  community: '커뮤니티',
  chat: '채팅',
  report: '신고',
  course: '강좌',
};

const KNOWN_TYPES = new Set<NotificationType>(
  Object.keys(NOTI_META) as NotificationType[],
);

/** 백엔드 ENUM 문자열 → UI 타입 (미지원 값은 전체 공지로 폴백) */
function normalizeType(raw: string): NotificationType {
  return KNOWN_TYPES.has(raw as NotificationType)
    ? (raw as NotificationType)
    : 'NOTICE';
}

/** type + referenceId → 이동 경로 */
function toHref(type: NotificationType, referenceId: number): string {
  switch (type) {
    case 'NOTICE':
      return `/notices/${referenceId}`;
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
    case 'COMMENT_ACCEPTED':
      return `/community/${referenceId}`;
    case 'REPORT':
      return `/admin/community/${referenceId}`;
    case 'COURSE_REGISTER':
      return '/admin/courses';
    default:
      return `/notices/${referenceId}`;
  }
}

/**
 * BE가 준 redirectUrl을 **동일 출처 절대경로**만 허용한다(외부/스킴/프로토콜상대 URL 차단).
 * 알림 클릭은 `<Link href>`로 이동하므로, 검증 안 된 BE 문자열이 오픈 리다이렉트가 되지 않게
 * 막고, 부적합하면 type 기반 안전 경로로 폴백한다(방어적 — push payload 미검증, BE M3 6/26 전).
 */
function sanitizeHref(redirectUrl: string | undefined, fallback: string): string {
  if (
    redirectUrl &&
    redirectUrl.startsWith('/') && // 동일 출처 절대경로만
    !redirectUrl.startsWith('//') && // 프로토콜 상대 URL(//host) 차단
    !redirectUrl.startsWith('/\\') // 백슬래시 트릭(/\host) 차단
  ) {
    return redirectUrl;
  }
  return fallback;
}

/** 백엔드 알림 항목 → UI 알림 항목 */
export function toNotificationItem(a: NotificationApiItem): NotificationItem {
  const type = normalizeType(a.type);
  return {
    notiId: a.notiId,
    type,
    category: TYPE_CATEGORY[type],
    message: a.message,
    isRead: a.isRead,
    // BE는 redirectUrl을 직접 제공(라이브 검증 2026-06-25) → 동일출처 검증 후 사용.
    // mock(referenceId만 있음)·부적합 URL은 type 기반 toHref로 폴백.
    href: sanitizeHref(a.redirectUrl, toHref(type, a.referenceId ?? 0)),
    createdAt: a.createdAt,
  };
}
