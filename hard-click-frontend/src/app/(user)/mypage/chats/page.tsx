import BackButton from '@/components/common/BackButton';
import { getMyChatRoomsServer } from '@/features/chat/server';
import ChatRoomListCard from '@/features/chat/components/ChatRoomListCard';

/**
 * 내 채팅방 전체목록 (Server Component) — `/mypage/chats`.
 * 마이페이지 "내 채팅방"의 "전체보기" 대상. getMyChatRoomsServer 재사용(BE 요청 추가 없음).
 * 레이아웃은 다른 마이페이지 하위 페이지(수강 중인 강의 등)와 통일.
 */
export default async function MyChatsPage() {
  // 개요(mypage/page)와 동일하게 실패 시 빈 목록으로 격하(전체 에러 페이지로 안 떨어지게).
  const chatRooms = await getMyChatRoomsServer().catch(() => []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full">
        <div className="mx-auto max-w-[1280px] px-8 pb-32 pt-9">
          {/* 페이지 히어로 (앱 표준 헤더) */}
          <div className="mb-8 flex items-center gap-4">
            <BackButton
              ariaLabel="뒤로가기"
              className="flex h-6 w-6 items-center justify-center text-[#4B5563] hover:text-[#1F2937]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </BackButton>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/commuComment.svg"
                    width={28}
                    height={28}
                    alt=""
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <h1 className="text-[30px] font-bold leading-9 tracking-[0.4px] text-[#1F2937]">
                  내 채팅방
                </h1>
              </div>
              <p className="text-base text-[#4B5563]">
                참여 중인 채팅방을 확인해보세요.
              </p>
            </div>
          </div>

          {/* 채팅방 카드 컨테이너 (흰 카드 래퍼) */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-[33px] shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
            {chatRooms.length === 0 ? (
              <p className="py-16 text-center text-base text-[#94A3B8]">
                참여 중인 채팅방이 없어요.
              </p>
            ) : (
              chatRooms.map((room) => (
                <ChatRoomListCard
                  key={room.chatRoomId}
                  room={room}
                  from="mychats"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
