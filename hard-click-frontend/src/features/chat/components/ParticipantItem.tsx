import type { ChatParticipant } from '../types';
import { getInitial } from '../utils';
import { maskName } from '@/lib/formatter';
import CrownIcon from './CrownIcon';

/**
 * 참여자 1명 — 이니셜 아바타 + 이름(마스킹) + 온라인 점(presence).
 * 방장은 앰버 링·왕관·"방장" 뱃지, 나는 "나" 뱃지.
 * kickable(방장이 보는 다른 참여자)이면 "내보내기" 버튼.
 */
export default function ParticipantItem({
  participant,
  isMe,
  isHost,
  kickable,
  onKick,
}: {
  participant: ChatParticipant;
  isMe: boolean;
  isHost: boolean;
  kickable: boolean;
  onKick: () => void;
}) {
  const name = maskName(participant.name);

  return (
    <li className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#F8FAFC]">
      <span className="relative flex-shrink-0">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
            isHost
              ? 'bg-[#FEF3C7] text-[#B45309] ring-2 ring-[#FCD34D]'
              : 'bg-[#E8EEF9] text-[#2F5DAA]'
          }`}
        >
          {getInitial(name)}
        </span>
        {/* 온라인/오프라인 점 (presence) */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
            participant.online ? 'bg-[#22C55E]' : 'bg-[#CBD5E1]'
          }`}
          aria-label={participant.online ? '온라인' : '오프라인'}
        />
      </span>
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className={`truncate text-sm font-medium ${
            participant.online ? 'text-[#334155]' : 'text-[#94A3B8]'
          }`}
        >
          {name}
        </span>
        {isHost && <CrownIcon size={13} />}
      </span>
      <span className="ml-auto flex flex-shrink-0 items-center gap-1">
        {isHost && (
          <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#B45309]">
            방장
          </span>
        )}
        {isMe && (
          <span className="rounded-full bg-[#EEF2F7] px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
            나
          </span>
        )}
        {kickable && (
          <button
            type="button"
            onClick={onKick}
            aria-label={`${name}님 내보내기`}
            title="내보내기"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#94A3B8] opacity-0 transition hover:bg-[#FEF2F2] hover:text-[#B91C1C] focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    </li>
  );
}
