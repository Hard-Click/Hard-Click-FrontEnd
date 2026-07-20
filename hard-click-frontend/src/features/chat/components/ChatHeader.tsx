import { useEffect, useState } from 'react';
import type { ChatRoomDetail } from '../types';

/**
 * 채팅방 헤더 — 뒤로가기(←) + 스터디명 + 과목 태그 + 참여자 수 + ⋮ 메뉴. (Figma)
 * 뒤로가기=멤버 유지하고 이전 화면으로(퇴장 아님). ⋮ 메뉴: 나가기(실제 퇴장)/채팅방 삭제(방장).
 */
export default function ChatHeader({
  room,
  participantCount,
  isHost,
  onBack,
  onDissolveClick,
  onLeaveClick,
}: {
  room: ChatRoomDetail;
  participantCount: number;
  isHost: boolean;
  onBack: () => void;
  onDissolveClick: () => void;
  onLeaveClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // 키보드 사용자: 메뉴 열린 상태에서 Escape로 닫기.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#4B5563] transition hover:bg-[#F1F5F9] hover:text-[#1F2937]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold text-[#1F2937]">
              {room.title}
            </h1>
            <span className="flex-shrink-0 rounded-full bg-[#E8EEF9] px-2.5 py-0.5 text-xs font-semibold text-[#2F5DAA]">
              {room.subjectName}
            </span>
            {room.status === 'CLOSED' && (
              <span className="flex-shrink-0 rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold text-[#64748B]">
                종료됨
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#64748B]">참여자 {participantCount}명</p>
        </div>
      </div>

      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="채팅방 메뉴"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9]"
        >
          <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" aria-hidden="true">
            <circle cx="2" cy="2" r="2" />
            <circle cx="2" cy="8" r="2" />
            <circle cx="2" cy="14" r="2" />
          </svg>
        </button>
        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            {/* w-max=글자 폭에 맞춰 딱 붙는 메뉴. p-1(항목 여백)+항목 rounded-lg 라 hover 배경이
                둥근 메뉴 안에 꽉 찬 알약으로 떨어진다(예전엔 py-1+각진 항목이라 가운데 띠처럼 떠 보였음). */}
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-2 w-max rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
            >
              {isHost ? (
                // 방장: 위임(방장 넘기기) 기능이 없어 나가기 불가 → 채팅방 삭제만.
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDissolveClick();
                  }}
                  className="block w-full whitespace-nowrap rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] focus-visible:bg-[#FEF2F2] focus-visible:outline-none"
                >
                  채팅방 삭제
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onLeaveClick();
                  }}
                  className="block w-full whitespace-nowrap rounded-lg px-4 py-2.5 text-center text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9] focus-visible:bg-[#F1F5F9] focus-visible:outline-none"
                >
                  나가기
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
