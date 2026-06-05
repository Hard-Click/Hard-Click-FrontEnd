/**
 * 채팅 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/users/me/chat-rooms (내 채팅방 목록, data는 배열 직접)
 */

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
    name: '스프링 1기 스터디',
    lastMessage: '이번 주 과제 공유해주세요',
    lastMessageAt: '2026-05-11T12:00:00+09:00',
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
