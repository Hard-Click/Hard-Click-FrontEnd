import type { ScheduleCalendarDay } from './types';

function toISODate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/** 일요일 시작, 주 단위(7칸) 배열. 이전/다음 달 여백 날짜 포함(마지막 주까지 7의 배수로 채움). */
export function getMonthCalendarWeeks(
  year: number,
  month: number,
  today: Date = new Date(),
): ScheduleCalendarDay[][] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const isToday = (y: number, m: number, d: number): boolean =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  const cells: ScheduleCalendarDay[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ date: toISODate(prevYear, prevMonth, day), day, inCurrentMonth: false, isToday: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: toISODate(year, month, day),
      day,
      inCurrentMonth: true,
      isToday: isToday(year, month, day),
    });
  }

  let nextMonthDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      date: toISODate(nextYear, nextMonth, nextMonthDay),
      day: nextMonthDay,
      inCurrentMonth: false,
      isToday: false,
    });
    nextMonthDay += 1;
  }

  const weeks: ScheduleCalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function formatMonthTitle(year: number, month: number): string {
  return `${year}년 ${month + 1}월`;
}

/** "yyyy-MM-dd" → 그 다음 날 "yyyy-MM-dd" (자정 넘어가는 할 일 표시용). */
export function nextDateISO(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(y, m - 1, d + 1);
  return toISODate(next.getFullYear(), next.getMonth(), next.getDate());
}

/** "HH:mm" → 자정 기준 분(minute). */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** 끝 시간이 시작 시간보다 같거나 빠르면 다음날로 넘어간 것으로 보고 24시간을 더해 range로 만든다. */
export function toRange(startTime: string, endTime: string): [number, number] {
  const s = toMinutes(startTime);
  let e = toMinutes(endTime);
  if (e <= s) e += 24 * 60;
  return [s, e];
}

/** 두 [시작,끝) 시간 구간이 겹치는지(자정 넘김 포함) 판정. */
export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const [as, ae] = toRange(aStart, aEnd);
  const [bs, be] = toRange(bStart, bEnd);
  return as < be && ae > bs;
}

const WEEKDAY_SHORT_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** "7/7 (월)" 형식. */
export function formatShortDateWithWeekday(date: Date): string {
  const weekday = WEEKDAY_SHORT_LABELS[date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()} (${weekday})`;
}
