import Image from 'next/image';
import Link from 'next/link';
import type { ChatRoomListItem, ChatEntrySource } from '../types';

/**
 * 내 채팅방 목록 카드 (마이페이지 개요 + 전체목록 `/mypage/chats` 공용).
 * 클릭 시 채팅방 진입. `from`으로 이탈 시 돌아갈 곳을 표시(개요=mypage / 전체목록=mychats).
 */
export default function ChatRoomListCard({
  room,
  from,
}: {
  room: ChatRoomListItem;
  from: ChatEntrySource;
}) {
  return (
    <Link
      href={`/chat/${room.chatRoomId}?from=${from}`}
      className="block rounded-[20px] border border-[#E2E8F0] p-5 transition-colors hover:bg-[#F8FAFC]"
    >
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold leading-7 text-[#1F2937]">
          {room.name}
        </p>
        {room.unreadCount > 0 && (
          <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#EF4444] px-2.5 text-sm font-bold text-white">
            {room.unreadCount}
          </span>
        )}
      </div>
      <p className="mb-2 mt-3 text-base font-medium text-[#4B5563]">
        {room.lastMessage}
      </p>
      <div className="flex items-center gap-2 text-sm font-medium text-[#4B5563]">
        <Image src="/icons/clockGrayIcon.svg" alt="" width={14} height={14} />
        <span>{room.lastMessageAt}</span>
      </div>
    </Link>
  );
}
