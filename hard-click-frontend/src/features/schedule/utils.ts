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

/**
 * 하루 단위 블록들을 "연속 날짜 + 같은 과목 + 같은 못함 여부"끼리 한 막대로 병합한다.
 *
 * <p>BE 슬롯은 하루 단위라 같은 과목이 며칠 이어져도 날별로 쪼개져 내려온다 → 캘린더에선
 * 이어진 한 막대로 보이는 게 자연스럽다. 단 MISSED(검정)와 비MISSED(과목색)는 색이 달라
 * 병합 경계로 삼는다 — 4일 연속 수학 중 하루만 못 했으면 [색][검정][색] 3개 막대가 된다.
 */
export function mergeScheduleBlocks(blocks: readonly ScheduleBlock[]): ScheduleBlock[] {
  // 병합 그룹: 과목 + 못함 여부. 그룹 안에서 날짜순 정렬 후 연속 날짜를 이어붙인다.
  const groups = new Map<string, ScheduleBlock[]>();
  for (const block of blocks) {
    const key = `${block.category}|${block.status === 'MISSED' ? 'missed' : 'active'}`;
    const group = groups.get(key);
    if (group) group.push(block);
    else groups.set(key, [block]);
  }

  const merged: ScheduleBlock[] = [];
  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => a.startDate.localeCompare(b.startDate));
    let current: ScheduleBlock | null = null;
    for (const block of sorted) {
      // 이어짐 = 겹치거나(같은 날 중복 슬롯) 바로 다음 날. 그 외엔 새 막대 시작.
      if (current && block.startDate <= nextDateISO(current.endDate)) {
        if (block.endDate > current.endDate) current = { ...current, endDate: block.endDate };
      } else {
        if (current) merged.push(current);
        current = { ...block };
      }
    }
    if (current) merged.push(current);
  }
  // 주별 세그먼트 계산엔 순서가 무관하지만, 렌더 키 안정성을 위해 시작일순으로 고정.
  return merged.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id));
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
