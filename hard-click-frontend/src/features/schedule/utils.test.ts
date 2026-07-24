/**
 * getMonthCalendarWeeks 날짜 계산 엣지케이스 — 월 경계(연도 롤오버) · 윤년 · 1일이 일/토요일인 달.
 */
import { getMonthCalendarWeeks, formatMonthTitle, getWeekBarSegments } from './utils';
import type { ScheduleBlock, ScheduleCalendarDay } from './types';

describe('getMonthCalendarWeeks', () => {
  it('12월→1월 경계: 마지막 주 여백 날짜가 다음 해 1월로 롤오버된다', () => {
    const weeks = getMonthCalendarWeeks(2026, 11); // 2026-12, firstWeekday=2(화), 31일
    const lastWeek = weeks[weeks.length - 1];
    const trailing = lastWeek.filter((day) => !day.inCurrentMonth);

    expect(trailing.length).toBeGreaterThan(0);
    trailing.forEach((day, i) => {
      expect(day.date).toBe(`2027-01-0${i + 1}`);
      expect(day.day).toBe(i + 1);
    });
  });

  it('1월→12월 경계: 첫 주 여백 날짜가 전 해 12월로 롤오버된다', () => {
    const weeks = getMonthCalendarWeeks(2026, 0); // 2026-01, firstWeekday=4(목), 31일
    const firstWeek = weeks[0];
    const leading = firstWeek.filter((day) => !day.inCurrentMonth);

    expect(leading.length).toBe(4);
    leading.forEach((day) => {
      expect(day.date.startsWith('2025-12-')).toBe(true);
    });
    // 12월의 마지막 날짜들이어야 한다 (2025-12-28~31)
    expect(leading.map((d) => d.day)).toEqual([28, 29, 30, 31]);
  });

  it('윤년 2월은 29일까지 포함한다', () => {
    const weeks = getMonthCalendarWeeks(2024, 1); // 2024-02, 윤년
    const currentMonthDays = weeks.flat().filter((day) => day.inCurrentMonth);

    expect(currentMonthDays).toHaveLength(29);
    expect(currentMonthDays[currentMonthDays.length - 1]).toMatchObject({
      day: 29,
      date: '2024-02-29',
    });
  });

  it('1일이 일요일이면 첫 주에 이전 달 여백 날짜가 없다', () => {
    const weeks = getMonthCalendarWeeks(2026, 1); // 2026-02, firstWeekday=0(일)
    const firstWeek = weeks[0];

    expect(firstWeek.every((day) => day.inCurrentMonth)).toBe(true);
    expect(firstWeek[0]).toMatchObject({ day: 1, date: '2026-02-01' });
  });

  it('1일이 토요일이면 첫 주에 이전 달 여백 날짜가 6일 채워진다', () => {
    const weeks = getMonthCalendarWeeks(2026, 7); // 2026-08, firstWeekday=6(토)
    const firstWeek = weeks[0];
    const leading = firstWeek.filter((day) => !day.inCurrentMonth);

    expect(leading).toHaveLength(6);
    expect(firstWeek[6]).toMatchObject({ day: 1, date: '2026-08-01', inCurrentMonth: true });
  });

  it('모든 주는 7칸이고, 오늘 날짜만 isToday=true다', () => {
    const today = new Date(2026, 6, 13); // 2026-07-13
    const weeks = getMonthCalendarWeeks(2026, 6, today);

    weeks.forEach((week) => expect(week).toHaveLength(7));

    const todayCells = weeks.flat().filter((day) => day.isToday);
    expect(todayCells).toEqual([
      expect.objectContaining({ date: '2026-07-13', day: 13, inCurrentMonth: true }),
    ]);
  });
});

describe('formatMonthTitle', () => {
  it('연/월(0-indexed)을 "YYYY년 M월"로 포맷한다', () => {
    expect(formatMonthTitle(2026, 0)).toBe('2026년 1월');
    expect(formatMonthTitle(2026, 11)).toBe('2026년 12월');
  });
});

describe('getWeekBarSegments', () => {
  // 2026-07-05(일) ~ 2026-07-11(토)
  const week: ScheduleCalendarDay[] = Array.from({ length: 7 }, (_, i) => ({
    date: `2026-07-${String(5 + i).padStart(2, '0')}`,
    day: 5 + i,
    inCurrentMonth: true,
    isToday: false,
  }));

  function block(id: string, startDate: string, endDate: string): ScheduleBlock {
    return { id, category: 'MATH', startDate, endDate };
  }

  it('주 안에 완전히 들어오는 구간은 그대로 컬럼 위치로 변환한다', () => {
    const segments = getWeekBarSegments(week, [block('a', '2026-07-06', '2026-07-08')]);
    expect(segments).toEqual([{ block: expect.objectContaining({ id: 'a' }), startCol: 2, span: 3, row: 0 }]);
  });

  it('주 시작 전부터 시작하는 구간은 이 주의 첫 칸부터로 clamp된다', () => {
    const segments = getWeekBarSegments(week, [block('b', '2026-07-03', '2026-07-07')]);
    expect(segments).toEqual([{ block: expect.objectContaining({ id: 'b' }), startCol: 1, span: 3, row: 0 }]);
  });

  it('주 끝 이후까지 이어지는 구간은 이 주의 마지막 칸까지로 clamp된다', () => {
    const segments = getWeekBarSegments(week, [block('c', '2026-07-09', '2026-07-15')]);
    expect(segments).toEqual([{ block: expect.objectContaining({ id: 'c' }), startCol: 5, span: 3, row: 0 }]);
  });

  it('이 주와 겹치지 않는 구간은 제외된다', () => {
    const before = block('before', '2026-07-01', '2026-07-03');
    const after = block('after', '2026-07-13', '2026-07-15');
    expect(getWeekBarSegments(week, [before, after])).toEqual([]);
  });

  it('컬럼이 겹치지 않는 구간들은 같은 행을 재사용한다(계단 방지)', () => {
    const segments = getWeekBarSegments(week, [
      block('x', '2026-07-05', '2026-07-06'),
      block('y', '2026-07-07', '2026-07-11'),
    ]);
    expect(segments).toHaveLength(2);
    expect(segments.map((s) => s.block.id)).toEqual(['x', 'y']);
    expect(segments.map((s) => s.row)).toEqual([0, 0]);
  });

  it('컬럼이 겹치는 구간은 다음 행으로 내려간다', () => {
    const segments = getWeekBarSegments(week, [
      block('x', '2026-07-05', '2026-07-08'),
      block('y', '2026-07-07', '2026-07-11'),
    ]);
    const rowById = Object.fromEntries(segments.map((s) => [s.block.id, s.row]));
    expect(rowById.x).toBe(0);
    expect(rowById.y).toBe(1);
  });

  it('세 구간 중 두 개만 겹치면 나머지 하나는 첫 행을 재사용한다', () => {
    const segments = getWeekBarSegments(week, [
      block('a', '2026-07-05', '2026-07-06'),
      block('b', '2026-07-06', '2026-07-08'),
      block('c', '2026-07-09', '2026-07-11'),
    ]);
    const rowById = Object.fromEntries(segments.map((s) => [s.block.id, s.row]));
    expect(rowById.a).toBe(0);
    expect(rowById.b).toBe(1);
    expect(rowById.c).toBe(0);
  });
});
