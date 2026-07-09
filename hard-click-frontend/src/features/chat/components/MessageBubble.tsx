import { memo } from 'react';
import type { ChatMessage } from '../types';
import { formatMessageTime, getInitial } from '../utils';
import { maskName } from '@/lib/formatter';
import CrownIcon from './CrownIcon';

/**
 * 채팅 말풍선 (카톡/인스타식) — 내 메시지는 오른쪽 파랑(#2F5DAA·흰 글씨),
 * 상대 메시지는 왼쪽 흰 말풍선(아바타 이니셜 + 이름). 이름은 마스킹.
 * grouped=연속 같은 발신자 → 아바타·이름 숨기고 붙여서 표시(카톡 그룹핑).
 * 방장 메시지는 앰버 아바타·이름 + 왕관 + "방장" 뱃지.
 */
// memo: 무한스크롤로 messages 배열 참조가 바뀌어도, message 객체는 불변 업데이트라 기존 말풍선 재렌더 차단.
function MessageBubble({
  message,
  isMine,
  isHost,
  grouped,
}: {
  message: ChatMessage;
  isMine: boolean;
  isHost: boolean;
  grouped: boolean;
}) {
  const time = formatMessageTime(message.sentAt);
  // CHAT만 이 컴포넌트로 오므로 senderName은 사실상 non-null (시스템은 SystemMessage).
  const name = maskName(message.senderName ?? '');
  const gap = grouped ? 'mt-0.5' : 'mt-3';

  if (isMine) {
    return (
      <li className={`flex items-end justify-end gap-2 ${gap}`}>
        <span className="mb-0.5 flex-shrink-0 text-[11px] text-[#64748B]">
          {time}
        </span>
        <div className="max-w-[75%] whitespace-pre-wrap break-words rounded-2xl bg-[#2F5DAA] px-4 py-2.5 text-[15px] leading-relaxed text-white sm:max-w-[440px]">
          {message.content}
        </div>
      </li>
    );
  }

  return (
    <li className={`flex items-start gap-2.5 ${gap}`}>
      {grouped ? (
        <span className="w-9 flex-shrink-0" aria-hidden="true" />
      ) : (
        <span
          className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isHost
              ? 'bg-[#FEF3C7] text-[#B45309] ring-2 ring-[#FCD34D]'
              : 'bg-[#E8EEF9] text-[#2F5DAA]'
          }`}
        >
          {getInitial(name)}
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        {!grouped && (
          <span className="flex items-center gap-1 text-[13px] font-semibold">
            {isHost && <CrownIcon size={13} />}
            <span className={isHost ? 'text-[#B45309]' : 'text-[#334155]'}>
              {name}
            </span>
            {isHost && (
              <span className="rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-bold text-[#B45309]">
                방장
              </span>
            )}
          </span>
        )}
        <div className="flex items-end gap-2">
          <div className="max-w-[75%] whitespace-pre-wrap break-words rounded-2xl bg-white px-4 py-2.5 text-[15px] leading-relaxed text-[#1F2937] shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:max-w-[440px]">
            {message.content}
          </div>
          <span className="mb-0.5 flex-shrink-0 text-[11px] text-[#64748B]">
            {time}
          </span>
        </div>
      </div>
    </li>
  );
}

export default memo(MessageBubble);
