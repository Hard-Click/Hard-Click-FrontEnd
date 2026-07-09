import { notFound } from 'next/navigation';
import {
  getChatRoomServer,
  getChatHistoryServer,
} from '@/features/chat/server';
import { getCurrentUser } from '@/features/auth/session';
import { isMock } from '@/mocks/config';
import { MOCK_MY_MEMBER_ID } from '@/mocks/chat.mock';
import ChatRoomClient from '@/features/chat/components/ChatRoomClient';

/**
 * 채팅방 페이지 (Server Component) — `/chat/{chatRoomId}`.
 * 스터디 상세/참여에서 받은 chatRoomId로 진입(진입 지점 연결은 추후 스터디 측과 협의).
 * 방정보·히스토리·내 memberId를 서버에서 확보해 client 오케스트레이터에 내린다.
 */
export default async function ChatRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ chatRoomId: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { chatRoomId: raw } = await params;
  const chatRoomId = Number(raw);
  if (!Number.isInteger(chatRoomId) || chatRoomId <= 0) notFound();

  const [room, history, user] = await Promise.all([
    getChatRoomServer(chatRoomId),
    getChatHistoryServer(chatRoomId),
    getCurrentUser(),
  ]);

  // 내 메시지 판별용 memberId — 로그인 쿠키에서. mock 프리뷰(비로그인)면 mock "나" id.
  const myMemberId = user?.memberId ?? (isMock('chat') ? MOCK_MY_MEMBER_ID : -1);

  // 진입 출처(?from=)에 따라 이탈 시 돌아갈 곳. 기본=스터디 게시판.
  const { from } = await searchParams;
  const returnUrl =
    from === 'mypage'
      ? '/mypage'
      : from === 'mychats'
        ? '/mypage/chats'
        : '/community?tab=스터디모집';

  return (
    // 헤더(sticky 64px) 아래 남은 화면 전체를 채운다 — 페이지는 스크롤 안 하고 메시지 목록만 내부 스크롤(카톡식).
    <div className="h-[calc(100dvh-64px)] overflow-hidden bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto h-full max-w-[1120px]">
        <ChatRoomClient
          key={room.chatRoomId}
          room={room}
          initialHistory={history}
          myMemberId={myMemberId}
          returnUrl={returnUrl}
        />
      </div>
    </div>
  );
}
