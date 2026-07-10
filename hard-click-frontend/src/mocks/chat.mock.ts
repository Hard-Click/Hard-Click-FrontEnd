/**
 * 채팅 도메인 목 데이터 — BE origin/main·feature/480 **코드검증 shape 그대로**(2026-07-10).
 * ⚠️ isMock('chat')=전역 USE_MOCK을 따라 mock으로 동작(라이브 200 미검증 → flip 전까지 mock).
 *
 * - GET /api/chat/rooms/me                  내 채팅방 목록 (data는 배열 직접. ⚠️ feature/480, main 미머지)
 * - GET /api/chat/rooms/{chatRoomId}        방정보 — hostId·title·subjectName·participants(online) 최상위 (main 머지됨, 한 콜)
 * - GET /api/chat/rooms/{chatRoomId}/messages  히스토리(커서 cursorId·size, ⚠️ feature/480 main 미머지, type=CHAT|SYSTEM_JOIN|SYSTEM_LEAVE)
 */

/* ───────────── 내 채팅방 목록 (기존) ───────────── */

export interface ChatRoomApiItem {
  chatRoomId: number;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export const mockChatRooms: ChatRoomApiItem[] = [
  {
    chatRoomId: 88,
    name: '주말 React 스터디',
    lastMessage: '그럼 일요일 저녁 8시로 정해요!',
    lastMessageAt: '2026-05-11T12:05:00+09:00',
    unreadCount: 3,
  },
  {
    chatRoomId: 91,
    name: '수능 국어 질문방',
    lastMessage: '내일 라이브 몇 시예요?',
    lastMessageAt: '2026-05-10T20:14:00+09:00',
    unreadCount: 0,
  },
];

/** 빈 목록 응답 예시(명세의 empty data example) */
export const mockChatRoomsEmpty: ChatRoomApiItem[] = [];

/* ───────────── 채팅방 정보 (GET /api/chat/rooms/{id}) ───────────── */

export interface ChatParticipantApi {
  memberId: number;
  name: string;
  /** presence — 방 구독 중이면 true (BE 제공) */
  online: boolean;
}

export interface ChatRoomDetailApi {
  chatRoomId: number;
  groupId: number;
  /** 방장 memberId (BE 확정: 방정보 최상위 필드). hostId===participants[].memberId로 방장 판별. */
  hostId: number | null;
  /** 채팅방(스터디) 제목 */
  title: string;
  /** 과목 — ⚠️ BE는 SubjectType enum **원본 코드값**(예: KO_READING). FE에서 subjectLabel()로 한글화. */
  subjectName: string;
  status: 'ACTIVE' | 'CLOSED';
  participants: ChatParticipantApi[];
  participantCount: number;
}

/** mock 기준 "나" = memberId 1 (김하드). page.tsx의 `user?.memberId ?? (isMock('chat') ? MOCK_MY_MEMBER_ID : -1)`가
 *  **비로그인 mock 프리뷰에서만** 이 값으로 대체한다(로그인 시엔 실 memberId 사용 → mock 방과 불일치할 수 있음). */
export const MOCK_MY_MEMBER_ID = 1;

export const mockChatRoomDetail: ChatRoomDetailApi = {
  chatRoomId: 88,
  groupId: 101,
  // 데모: 나(1=김하드)를 방장으로 둔다 → 강퇴/삭제 버튼 노출 확인용.
  // (실제론 스터디 게시물 작성자가 방장. 다른 사람이 방장이면 그 사람 메시지에 왕관이 붙음.)
  hostId: MOCK_MY_MEMBER_ID,
  title: '주말 React 스터디',
  subjectName: 'React', // subjectLabel() 통과(미매칭은 원본 유지). 실 BE는 enum 코드값.
  status: 'ACTIVE',
  participants: [
    { memberId: 1, name: '김하드', online: true },
    { memberId: 2, name: '이클릭', online: true },
    { memberId: 3, name: '박플로운', online: false },
  ],
  participantCount: 3,
};

/* ───────────── 채팅 히스토리 (GET .../messages, 최신순 desc) ───────────── */

export interface ChatMessageApi {
  type: 'CHAT' | 'SYSTEM_JOIN' | 'SYSTEM_LEAVE' | 'SYSTEM_KICK';
  messageId: number;
  /** 시스템 메시지(SYSTEM_JOIN/LEAVE)는 null */
  senderId: number | null;
  senderName: string | null;
  content: string;
  sentAt: string;
}

export interface ChatHistoryApi {
  messages: ChatMessageApi[];
  hasNext: boolean;
  nextCursorId: number | null;
}

/** mock은 최신순(newest first)로 authored. UI(ChatRoomClient)가 오래된→최신으로 뒤집어 표시.
 *  ⚠️ 실 BE는 페이지 내부를 오래된→최신(asc)으로 주지만 server.ts가 messageId desc로 정규화하므로 계약 동일. */
export const mockChatHistory: ChatHistoryApi = {
  messages: [
    {
      type: 'CHAT',
      messageId: 105,
      senderId: 2,
      senderName: '이클릭',
      content: '그럼 일요일 저녁 8시로 정해요!',
      sentAt: '2026-05-11T12:05:00+09:00',
    },
    {
      type: 'CHAT',
      messageId: 104,
      senderId: 1,
      senderName: '김하드',
      content: '저는 주말 아무 때나 좋아요 👍',
      sentAt: '2026-05-11T12:03:00+09:00',
    },
    {
      type: 'CHAT',
      messageId: 103,
      senderId: 3,
      senderName: '박플로운',
      content: '이번 주 과제 먼저 공유해 주세요~',
      sentAt: '2026-05-11T12:00:00+09:00',
    },
    {
      type: 'SYSTEM_JOIN',
      messageId: 102,
      senderId: null,
      senderName: null,
      // ⚠️ 시스템 메시지 이름은 content 문장에 박혀 오고 BE가 이미 마스킹(명세 예: "김*민님이 입장했습니다").
      //    FE는 그대로 표시. mock도 마스킹된 이름으로 맞춤(박플로운 → 박**운).
      content: '박**운님이 입장했습니다',
      sentAt: '2026-05-11T11:59:00+09:00',
    },
    {
      type: 'CHAT',
      messageId: 101,
      senderId: 2,
      senderName: '이클릭',
      content: '안녕하세요! 리액트 스터디 시작해요',
      sentAt: '2026-05-11T11:58:00+09:00',
    },
  ],
  hasNext: true,
  nextCursorId: 101, // 이 페이지 가장 오래된 messageId — 더 옛 메시지 조회 커서
};

/** 옛 메시지 2페이지 (커서=101로 조회 시). 무한스크롤 검증용. */
export const mockChatHistoryOlder: ChatHistoryApi = {
  messages: [
    {
      type: 'CHAT',
      messageId: 100,
      senderId: 3,
      senderName: '박플로운',
      content: '저도 방금 들어왔어요!',
      sentAt: '2026-05-11T11:57:00+09:00',
    },
    {
      type: 'CHAT',
      messageId: 99,
      senderId: 2,
      senderName: '이클릭',
      content: '반가워요~ 간단히 자기소개 할까요?',
      sentAt: '2026-05-11T11:56:00+09:00',
    },
    {
      type: 'CHAT',
      messageId: 98,
      senderId: 1,
      senderName: '김하드',
      content: '넵 좋아요 👍',
      sentAt: '2026-05-11T11:55:00+09:00',
    },
    {
      type: 'SYSTEM_JOIN',
      messageId: 97,
      senderId: null,
      senderName: null,
      content: '김*드님이 입장했습니다',
      sentAt: '2026-05-11T11:54:00+09:00',
    },
  ],
  hasNext: false,
  nextCursorId: null,
};
