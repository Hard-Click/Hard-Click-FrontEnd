/**
 * 채팅 도메인 UI 계약(격리막). UI 컴포넌트는 **이 타입에만** 의존한다.
 * BE 응답 shape(ApiXxx)는 여기 두지 않고 server.ts 내부 / mock 파일에 숨긴다.
 *
 * ⚠️ 채팅 BE 명세는 확정(2026-07-08 유강현, docs/스터디채팅_STOMP_연동.md §7)이나 아직 미배포.
 *    server.ts는 isMock('chat')로 mock을 쓰고, 실시간(STOMP)은 seam(미연결)이다.
 */

/** 히스토리/리스트 메시지 종류. SYSTEM_* 는 시스템 메시지(가운데 pill). */
export type ChatMessageType =
  | 'CHAT'
  | 'SYSTEM_JOIN'
  | 'SYSTEM_LEAVE'
  | 'SYSTEM_KICK';

/** 채팅 메시지 (히스토리 GET·STOMP CHAT/SYSTEM 이벤트 → 리스트 항목 공통) */
export interface ChatMessage {
  messageId: number;
  type: ChatMessageType;
  /** 시스템 메시지(SYSTEM_JOIN/LEAVE)는 null. */
  senderId: number | null;
  senderName: string | null;
  content: string;
  /** ISO 8601 (예: 2026-07-07T21:00:00+09:00) */
  sentAt: string;
}

/** 채팅방 참여자. online = 현재 방 구독 중(presence, BE 제공). */
export interface ChatParticipant {
  memberId: number;
  name: string;
  online: boolean;
}

/** 채팅방 정보 (GET /api/chat-rooms/{id} — BE 확정 §7: hostId·title·subjectName을 방정보 최상위로 제공, 한 콜).
 *  방장 판별은 hostId===participants[].memberId. hostId가 null이면 방장 표시 숨김. */
export interface ChatRoomDetail {
  chatRoomId: number;
  groupId: number;
  hostId: number | null;
  title: string;
  subjectName: string;
  status: 'ACTIVE' | 'CLOSED';
  participants: ChatParticipant[];
  participantCount: number;
}

/** 채팅 히스토리 한 페이지 (커서 기반). BE는 최신순(desc)으로 준다. */
export interface ChatHistoryPage {
  messages: ChatMessage[];
  hasNext: boolean;
  nextCursorId: number | null;
}

/** 채팅방 진입 출처 — 이탈 시 돌아갈 곳(page의 returnUrl)을 결정. 오타 방지용 유니언. */
export type ChatEntrySource = 'mypage' | 'mychats';

/** 내 채팅방 목록 항목 (GET /api/chat/rooms/me). lastMessageAt은 표시용 상대시간. */
export interface ChatRoomListItem {
  chatRoomId: number;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

/**
 * `/sub/chat-rooms/{id}` 단일 구독으로 흐르는 이벤트(`type`으로 분기). (실시간 seam — docs §7)
 * - CHAT: 일반 메시지(본인 것도 echo). senderId===내 memberId면 우측.
 * - SYSTEM_JOIN/LEAVE: 입퇴장 시스템 메시지(`message`, 마스킹) + 갱신된 참여자 목록/카운트.
 * - SYSTEM_KICK: 강퇴. `kickedMemberId`===내 memberId면 본인 튕김, 나머진 목록 갱신.
 * - SYSTEM_CLOSED: 방 해산 → 전원 튕김.
 * - TYPING: 입력 중(본인 것도 echo → 무시). "중지" 이벤트 없음 → 3초 타이머로 끔.
 * - PRESENCE_UPDATE: online 상태만 갱신.
 */
export type ChatSocketEvent =
  | {
      type: 'CHAT';
      messageId: number;
      senderId: number;
      senderName: string;
      content: string;
      sentAt: string;
    }
  | {
      type: 'SYSTEM_JOIN' | 'SYSTEM_LEAVE';
      message: string;
      participantCount: number;
      participants: ChatParticipant[];
    }
  | {
      type: 'SYSTEM_KICK';
      message: string;
      kickedMemberId: number;
      participantCount: number;
      participants: ChatParticipant[];
    }
  | { type: 'SYSTEM_CLOSED'; message: string }
  | { type: 'TYPING'; memberId: number; name: string }
  | { type: 'PRESENCE_UPDATE'; participants: ChatParticipant[] };
