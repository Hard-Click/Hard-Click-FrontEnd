import { useRef, useState } from 'react';

/**
 * 메시지 입력창 + 전송 버튼.
 * - Enter 전송(Shift+Enter 줄바꿈).
 * - 입력 중 타이핑 핑을 2초에 1번만 발행(throttle) — BE엔 "입력 중지" 이벤트가 없고 수신측이
 *   마지막 핑 후 3초면 자동으로 끄므로, 계속 입력 중이면 3초 안에 재핑되도록 2초 간격.
 * - 방이 CLOSED면 disabled.
 */
const TYPING_PING_INTERVAL_MS = 2000;

export default function MessageInput({
  disabled = false,
  onSend,
  onTyping,
}: {
  disabled?: boolean;
  onSend: (content: string) => void;
  onTyping: () => void;
}) {
  const [value, setValue] = useState('');
  const lastPingRef = useRef(0);

  const handleChange = (next: string) => {
    setValue(next);
    if (disabled || !next.trim()) return;
    const now = Date.now();
    if (now - lastPingRef.current > TYPING_PING_INTERVAL_MS) {
      lastPingRef.current = now;
      onTyping();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    lastPingRef.current = 0;
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="flex items-end gap-3 border-t border-[#E2E8F0] bg-white px-6 py-4">
      <textarea
        rows={1}
        aria-label="메시지 입력"
        value={value}
        disabled={disabled}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          // IME 조합 중(한글 음절 확정용) Enter는 전송 제외 — 안 그러면 "안녕하"가 미완성으로 전송됨.
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={
          disabled ? '종료된 채팅방입니다.' : '메시지를 입력하세요...'
        }
        className="max-h-32 flex-1 resize-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[15px] text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2F5DAA] disabled:cursor-not-allowed disabled:bg-[#F1F5F9]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        className="flex-shrink-0 rounded-xl bg-[#2F5DAA] px-5 py-2.5 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#274C8C] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
      >
        전송
      </button>
    </div>
  );
}
