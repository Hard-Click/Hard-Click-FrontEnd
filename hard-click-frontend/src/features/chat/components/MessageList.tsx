import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import TypingIndicator from './TypingIndicator';

/**
 * 메시지 스크롤 영역 (카톡식) — 화면 높이 고정, 이 영역만 내부 스크롤.
 * CHAT은 말풍선, SYSTEM은 가운데 pill. 연속 같은 발신자는 그룹핑(아바타·이름 1회).
 *
 * 스크롤 동작:
 *   - 위로 올려 상단 근처 → onLoadOlder()로 옛 메시지 prepend. 붙은 뒤 "바닥 기준 거리"를
 *     유지해 보던 위치가 튀지 않게 한다(useLayoutEffect, prepend 분기).
 *   - 새 메시지·타이핑 → 바닥 근처였을 때만 맨 아래로 따라 내려간다(위로 읽는 중이면 방해 X).
 */
export default function MessageList({
  messages,
  myMemberId,
  hostId,
  typingNames,
  hasMore,
  loadingOlder,
  onLoadOlder,
}: {
  messages: ChatMessage[];
  myMemberId: number;
  hostId: number | null;
  typingNames: string[];
  hasMore: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // prepend 위치 보존: 로드 트리거 시점의 "바닥까지 거리"를 저장 → 붙은 뒤 그대로 복원.
  const prevDistRef = useRef(0);
  const prependingRef = useRef(false);
  // 옛 메시지 로드 트리거 후 재진입 가드(state는 리렌더 전까지 반영 안 돼 동기 재발화 못 막음).
  const triggeredRef = useRef(false);
  // 실제 prepend(맨 앞 메시지 변경) 판별용 — prependingRef가 고착돼도 오복원 방지.
  const prevFirstIdRef = useRef<number | null>(null);
  // 사용자가 바닥 근처인지(새 메시지 자동 추적 여부). 초기 마운트는 바닥으로 내려야 하니 true.
  const atBottomRef = useRef(true);

  // 부모 로드 완료(loadingOlder=false; 성공·중복·에러 무관) 시 트리거 가드 해제.
  useEffect(() => {
    if (!loadingOlder) triggeredRef.current = false;
  }, [loadingOlder]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (
      hasMore &&
      !loadingOlder &&
      !triggeredRef.current &&
      el.scrollTop <= 48
    ) {
      prevDistRef.current = el.scrollHeight - el.scrollTop;
      prependingRef.current = true;
      triggeredRef.current = true; // 동기 재발화 차단
      onLoadOlder();
    }
  };

  // messages 변경 시: 진짜 prepend면 바닥까지 거리 복원, 아니면 하단 추적.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstId = messages[0]?.messageId ?? null;
    const lastMsg = messages[messages.length - 1];
    // prepend = 트리거됐고 + 맨 앞 메시지가 실제로 바뀐 경우만(참조 bail-out으로 플래그가 고착돼도 안전).
    const isPrepend =
      prependingRef.current &&
      prevFirstIdRef.current !== null &&
      firstId !== prevFirstIdRef.current;
    prependingRef.current = false; // 어떤 경로든 항상 해제(고착 방지)
    prevFirstIdRef.current = firstId;

    if (isPrepend) {
      el.scrollTop = el.scrollHeight - prevDistRef.current;
    } else if (atBottomRef.current || lastMsg?.senderId === myMemberId) {
      // 내가 보낸 메시지는 위치 무관 항상 바닥으로. 그 외 append는 바닥 근처였을 때만(위 읽는 중 방해 X).
      el.scrollTop = el.scrollHeight;
    }

    // 콘텐츠가 뷰포트를 못 채워 스크롤바가 없으면(짧은 첫 페이지·큰 화면) onScroll이 안 떠
    // 옛 메시지에 도달 못 함 → hasMore인 동안 자동으로 다음 페이지를 1회씩 당겨온다.
    if (
      hasMore &&
      !loadingOlder &&
      !triggeredRef.current &&
      el.scrollHeight <= el.clientHeight
    ) {
      prevDistRef.current = el.scrollHeight - el.scrollTop;
      prependingRef.current = true;
      triggeredRef.current = true;
      onLoadOlder();
    }
  }, [messages, myMemberId, hasMore, loadingOlder, onLoadOlder]);

  // 타이핑 표시 등장/변화 → 바닥 근처면 하단으로.
  useEffect(() => {
    if (!atBottomRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typingNames]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FB] px-4 py-4 sm:px-6"
    >
      {loadingOlder && (
        <p className="pb-2 text-center text-xs text-[#94A3B8]">
          이전 메시지 불러오는 중…
        </p>
      )}
      {!hasMore && messages.length > 0 && (
        <p className="pb-2 text-center text-xs text-[#CBD5E1]">
          대화의 시작이에요
        </p>
      )}
      <ul className="flex flex-col">
        {messages.map((m, i) => {
          if (m.type !== 'CHAT') {
            // SYSTEM_JOIN / SYSTEM_LEAVE / SYSTEM_KICK — 가운데 시스템 pill
            return <SystemMessage key={m.messageId} content={m.content} />;
          }
          const prev = messages[i - 1];
          const grouped =
            !!prev && prev.type === 'CHAT' && prev.senderId === m.senderId;
          return (
            <MessageBubble
              key={m.messageId}
              message={m}
              isMine={m.senderId === myMemberId}
              isHost={m.senderId === hostId}
              grouped={grouped}
            />
          );
        })}
        <TypingIndicator names={typingNames} />
      </ul>
    </div>
  );
}
