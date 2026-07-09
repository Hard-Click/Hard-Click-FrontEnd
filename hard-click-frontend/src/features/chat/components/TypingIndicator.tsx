import { getInitial } from '../utils';
import { maskName } from '@/lib/formatter';

/**
 * 타이핑 인디케이터 (카톡/인스타식) — 수신 말풍선 모양(아바타 + 이름 + 점 3개 bounce).
 * (Figma에 없던 요소. BE가 타이핑 알림 지원 확정 → 상대 말풍선 톤으로 신규 디자인.)
 */
export default function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  const first = maskName(names[0]);
  const extra = names.length > 1 ? ` 외 ${names.length - 1}명` : '';

  return (
    <li
      className="mt-3 flex items-start gap-2.5"
      aria-live="polite"
      aria-label={`${first}${extra}님이 입력 중`}
    >
      <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E8EEF9] text-sm font-bold text-[#2F5DAA]">
        {getInitial(first)}
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold text-[#334155]">
          {first}
          {extra}
        </span>
        <span className="flex w-fit items-center gap-1 rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8]"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8]"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8]"
            style={{ animationDelay: '300ms' }}
          />
        </span>
      </div>
    </li>
  );
}
