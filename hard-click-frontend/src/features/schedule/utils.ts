import type { ScheduleBlock, ScheduleCalendarDay, WeekBarSegment } from './types';

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

const WEEKDAY_SHORT_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** "7/7 (월)" 형식. */
export function formatShortDateWithWeekday(date: Date): string {
  const weekday = WEEKDAY_SHORT_LABELS[date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()} (${weekday})`;
}

/**
 * 이 주(week, 7칸)와 겹치는 학습 구간들을 그 주 안으로 clamp해서 grid-column 위치로 변환.
 * 구간이 주 경계를 넘어가면(예: 화~다음주 목) 이 주에 걸친 부분만큼만 잘라 반환 —
 * 다음 주 호출에서 나머지 부분이 별도 세그먼트로 다시 계산된다.
 */
export function getWeekBarSegments(
  week: readonly ScheduleCalendarDay[],
  blocks: readonly ScheduleBlock[],
): WeekBarSegment[] {
  const weekStart = week[0].date;
  const weekEnd = week[week.length - 1].date;

  return blocks
    .filter((block) => block.endDate >= weekStart && block.startDate <= weekEnd)
    .map((block) => {
      const clampedStart = block.startDate < weekStart ? weekStart : block.startDate;
      const clampedEnd = block.endDate > weekEnd ? weekEnd : block.endDate;
      const startCol = week.findIndex((day) => day.date === clampedStart) + 1;
      const endCol = week.findIndex((day) => day.date === clampedEnd) + 1;
      return { block, startCol, span: endCol - startCol + 1 };
    });
}
