/**
 * 채팅 조회 (Server Component 전용). 격리막 — UI는 도메인 타입(types.ts)만 본다.
 * ⚠️ isMock('chat')=전역 USE_MOCK(true)라 지금은 항상 mock 분기.
 *    REST 경로 3개 모두 BE **origin/main·develop 머지 완료**(2026-07-10 확인, ChatRoomController):
 *      - GET /api/chat/rooms/{id}            방정보
 *      - GET /api/chat/rooms/{id}/messages   히스토리
 *      - GET /api/chat/rooms/me              내 목록
 *    응답 shape는 BE record와 일치 확인. **남은 것 = 배포서버 가동 + 로그인 200 검증 후 MOCK_OVERRIDE에 chat:false.**
 *    (2026-07-10 시점: 배포서버 13.125.94.217 다운 상태라 라이브 검증 대기.)
 */

import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { subjectLabel } from '@/features/courses/subjects';
import { maskName, relativeTime } from '@/lib/formatter';
import {
  mockChatRoomDetail,
  mockChatHistory,
  mockChatHistoryOlder,
  mockChatRooms,
  type ChatRoomDetailApi,
  type ChatMessageApi,
  type ChatHistoryApi,
  type ChatRoomApiItem,
} from '@/mocks/chat.mock';
import type {
  ChatRoomDetail,
  ChatMessage,
  ChatHistoryPage,
  ChatRoomListItem,
} from './types';

/**
 * BE 방정보 → UI 계약 매퍼(격리막).
 * BE 확정(§7): hostId·title·subjectName가 방정보 최상위에 온다(한 콜).
 * subjectName은 SubjectType enum 원본 코드값이라 subjectLabel()로 한글화(미매칭은 원본 유지).
 */
function toChatRoomDetail(api: ChatRoomDetailApi): ChatRoomDetail {
  return {
    chatRoomId: api.chatRoomId,
    groupId: api.groupId,
    hostId: api.hostId, // null이면 방장 표시 숨김
    title: api.title,
    subjectName: subjectLabel(api.subjectName),
    status: api.status,
    participants: api.participants.map((p) => ({
      memberId: p.memberId,
      // PII: 실명은 BFF(서버)에서 마스킹해 내려보낸다(브라우저 raw 노출 방지, rankings 컨벤션). 아바타 첫 글자는 유지.
      name: maskName(p.name),
      online: p.online,
    })),
    participantCount: api.participantCount,
  };
}

/** BE 메시지 → UI 계약 매퍼. 시스템 메시지는 senderId/senderName이 null. */
function toChatMessage(api: ChatMessageApi): ChatMessage {
  return {
    messageId: api.messageId,
    type: api.type,
    senderId: api.senderId,
    // 시스템 메시지는 senderName null. 일반 메시지 실명은 서버에서 마스킹(PII).
    senderName: api.senderName === null ? null : maskName(api.senderName),
    content: api.content,
    sentAt: api.sentAt,
  };
}

/**
 * 채팅방 정보 조회. 실패는 빈 데이터로 숨기지 않고 전파 → error.tsx.
 */
export async function getChatRoomServer(
  chatRoomId: number,
): Promise<ChatRoomDetail> {
  if (isMock('chat')) return toChatRoomDetail(mockChatRoomDetail);

  // ── BE 연동 seam ── (hostId·title·subjectName 포함, 한 콜. BE 코드검증 경로)
  const res = await serverApi.get<ChatRoomDetailApi>(
    `/api/chat/rooms/${chatRoomId}`,
  );
  if (!res.success || !res.data) {
    throw new Error('채팅방 정보를 불러오지 못했습니다.');
  }
  return toChatRoomDetail(res.data);
}

/**
 * 채팅 히스토리 조회 (커서 기반). BE는 최신순(desc)으로 준다.
 */
export async function getChatHistoryServer(
  chatRoomId: number,
  cursorId?: number,
): Promise<ChatHistoryPage> {
  if (isMock('chat')) {
    // 커서 있으면 옛 메시지 페이지, 없으면 최신 페이지 (무한스크롤 mock)
    const page = cursorId ? mockChatHistoryOlder : mockChatHistory;
    return {
      messages: page.messages.map(toChatMessage),
      hasNext: page.hasNext,
      nextCursorId: page.nextCursorId,
    };
  }

  // ── BE 연동 seam ── (BE 코드검증 경로·쿼리파라미터: cursorId·size)
  const query = cursorId ? `?cursorId=${cursorId}&size=20` : '?size=20';
  const res = await serverApi.get<ChatHistoryApi>(
    `/api/chat/rooms/${chatRoomId}/messages${query}`,
  );
  if (!res.success || !res.data) {
    throw new Error('채팅 내역을 불러오지 못했습니다.');
  }
  // ⚠️ BE는 페이지 내부를 오래된→최신(asc)으로 준다(ChatMessageQueryService 확인). FE 계약은 최신순(desc,
  //    ChatRoomClient가 reverse해 표시) → messageId(DB PK 단조증가) 기준 desc로 정규화(순서 소스 무관하게 안전).
  //    (라이브 첫 페이지로 순서 재확인 필요 — 미실행 검증.)
  const messages = [...res.data.messages]
    .sort((a, b) => b.messageId - a.messageId)
    .map(toChatMessage);
  return {
    messages,
    hasNext: res.data.hasNext,
    nextCursorId: res.data.nextCursorId,
  };
}

/** 내 채팅방 목록 매퍼 — lastMessageAt은 서버에서 상대시간 문자열로 변환. */
function toChatRoomListItem(api: ChatRoomApiItem): ChatRoomListItem {
  return {
    chatRoomId: api.chatRoomId,
    name: api.name,
    lastMessage: api.lastMessage,
    // 메시지 없는 방은 lastMessageAt이 null일 수 있음 — relativeTime(new Date(null)=0 → "1970.01.01") 방지.
    lastMessageAt: api.lastMessageAt ? relativeTime(api.lastMessageAt) : '',
    unreadCount: api.unreadCount,
  };
}

/**
 * 내 채팅방 목록 (마이페이지 "내 채팅방" 섹션). 실패는 전파 → 호출부(page)가 catch로 빈 목록.
 */
export async function getMyChatRoomsServer(): Promise<ChatRoomListItem[]> {
  if (isMock('chat')) return mockChatRooms.map(toChatRoomListItem);

  // ── BE 연동 seam ── (BE 코드검증 경로. data는 배열 직접)
  const res = await serverApi.get<ChatRoomApiItem[]>('/api/chat/rooms/me');
  if (!res.success || !res.data) {
    throw new Error('채팅방 목록을 불러오지 못했습니다.');
  }
  return res.data.map(toChatRoomListItem);
}
