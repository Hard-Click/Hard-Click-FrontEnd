import type { ChatParticipant } from '../types';
import ParticipantItem from './ParticipantItem';

/**
 * 참여자 사이드바 — "참여자 N명" + 목록. 방장이 맨 위, 많아지면 내부 스크롤.
 * 모바일에선 숨김(채팅 영역 우선), 데스크톱에서 화면 높이 고정.
 * viewerIsHost면 다른 참여자에 "내보내기"(강퇴) 버튼 노출.
 */
export default function ParticipantSidebar({
  participants,
  myMemberId,
  hostId,
  viewerIsHost,
  onKick,
}: {
  participants: ChatParticipant[];
  myMemberId: number;
  hostId: number | null;
  viewerIsHost: boolean;
  onKick: (participant: ChatParticipant) => void;
}) {
  // 방장을 맨 위로
  const ordered = [...participants].sort(
    (a, b) => Number(b.memberId === hostId) - Number(a.memberId === hostId),
  );

  return (
    <aside className="hidden h-full w-[260px] flex-shrink-0 flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_10px_rgba(0,0,0,0.04)] lg:flex">
      <h2 className="px-2 text-sm font-bold text-[#1F2937]">
        참여자 <span className="text-[#2F5DAA]">{participants.length}</span>명
      </h2>
      <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {ordered.map((p) => (
          <ParticipantItem
            key={p.memberId}
            participant={p}
            isMe={p.memberId === myMemberId}
            isHost={p.memberId === hostId}
            kickable={
              viewerIsHost &&
              p.memberId !== myMemberId &&
              p.memberId !== hostId
            }
            onKick={() => onKick(p)}
          />
        ))}
      </ul>
    </aside>
  );
}
