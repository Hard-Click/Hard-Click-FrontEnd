/**
 * 주차 배지 — 「N주」 파란 둥근 사각. 강사 퀴즈 목록 + 수강생 퀴즈 목록 공용.
 * size: lg(강사, 64px) / md(학생, 56px).
 */
export default function WeekBadge({
  week,
  size = 'md',
}: {
  week: number;
  size?: 'md' | 'lg';
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-[#2F5DAA1a] font-bold text-[#2F5DAA] ${
        size === 'lg'
          ? 'h-16 w-16 rounded-[20px] text-2xl'
          : 'h-14 w-14 rounded-2xl text-base'
      }`}
    >
      {week}주
    </span>
  );
}
