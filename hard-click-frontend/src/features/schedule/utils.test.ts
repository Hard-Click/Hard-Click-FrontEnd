/**
 * getMonthCalendarWeeks 날짜 계산 엣지케이스 — 월 경계(연도 롤오버) · 윤년 · 1일이 일/토요일인 달.
 */
import { getMonthCalendarWeeks, formatMonthTitle, getWeekBarSegments, mergeScheduleBlocks } from './utils';
import type { ScheduleBlock, ScheduleBlockStatus, ScheduleCalendarDay } from './types';

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
    expect(segments).toEqual([{ block: expect.objectContaining({ id: 'a' }), startCol: 2, span: 3 }]);
  });

  it('주 시작 전부터 시작하는 구간은 이 주의 첫 칸부터로 clamp된다', () => {
    const segments = getWeekBarSegments(week, [block('b', '2026-07-03', '2026-07-07')]);
    expect(segments).toEqual([{ block: expect.objectContaining({ id: 'b' }), startCol: 1, span: 3 }]);
  });

  it('주 끝 이후까지 이어지는 구간은 이 주의 마지막 칸까지로 clamp된다', () => {
    const segments = getWeekBarSegments(week, [block('c', '2026-07-09', '2026-07-15')]);
    expect(segments).toEqual([{ block: expect.objectContaining({ id: 'c' }), startCol: 5, span: 3 }]);
  });

  it('이 주와 겹치지 않는 구간은 제외된다', () => {
    const before = block('before', '2026-07-01', '2026-07-03');
    const after = block('after', '2026-07-13', '2026-07-15');
    expect(getWeekBarSegments(week, [before, after])).toEqual([]);
  });

  it('겹치는 구간이 여러 개면 전부 반환한다(스택 렌더링용)', () => {
    const segments = getWeekBarSegments(week, [
      block('x', '2026-07-05', '2026-07-06'),
      block('y', '2026-07-07', '2026-07-11'),
    ]);
    expect(segments).toHaveLength(2);
    expect(segments.map((s) => s.block.id)).toEqual(['x', 'y']);
  });
});

describe('mergeScheduleBlocks', () => {
  function day(id: string, date: string, category: ScheduleBlock['category'], status?: ScheduleBlockStatus): ScheduleBlock {
    return { id, category, startDate: date, endDate: date, status };
  }

  it('연속 날짜의 같은 과목 하루 블록들을 한 막대로 병합한다', () => {
    const merged = mergeScheduleBlocks([
      day('1', '2026-07-06', 'MATH'),
      day('2', '2026-07-07', 'MATH'),
      day('3', '2026-07-08', 'MATH'),
    ]);
    expect(merged).toEqual([
      expect.objectContaining({ category: 'MATH', startDate: '2026-07-06', endDate: '2026-07-08' }),
    ]);
  });

  it('날짜가 하루라도 비면 별도 막대로 남긴다', () => {
    const merged = mergeScheduleBlocks([
      day('1', '2026-07-06', 'MATH'),
      day('2', '2026-07-08', 'MATH'), // 7일 비어 있음
    ]);
    expect(merged.map((b) => [b.startDate, b.endDate])).toEqual([
      ['2026-07-06', '2026-07-06'],
      ['2026-07-08', '2026-07-08'],
    ]);
  });

  it('과목이 다르면 연속 날짜여도 병합하지 않는다', () => {
    const merged = mergeScheduleBlocks([
      day('1', '2026-07-06', 'MATH'),
      day('2', '2026-07-07', 'ENGLISH'),
    ]);
    expect(merged).toHaveLength(2);
  });

  it('MISSED(못함)는 같은 과목 연속이어도 비MISSED와 병합하지 않는다 — 검정/과목색 경계 유지', () => {
    const merged = mergeScheduleBlocks([
      day('1', '2026-07-06', 'MATH', 'PLANNED'),
      day('2', '2026-07-07', 'MATH', 'MISSED'),
      day('3', '2026-07-08', 'MATH', 'PLANNED'),
    ]);
    expect(merged.map((b) => [b.startDate, b.endDate, b.status])).toEqual([
      ['2026-07-06', '2026-07-06', 'PLANNED'],
      ['2026-07-07', '2026-07-07', 'MISSED'],
      ['2026-07-08', '2026-07-08', 'PLANNED'],
    ]);
  });

  it('DONE과 PLANNED는 같은 색(과목색)이므로 연속이면 병합한다', () => {
    const merged = mergeScheduleBlocks([
      day('1', '2026-07-06', 'MATH', 'DONE'),
      day('2', '2026-07-07', 'MATH', 'PLANNED'),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ startDate: '2026-07-06', endDate: '2026-07-07' });
  });

  it('같은 날 중복 슬롯(같은 과목 2강)은 하나로 흡수된다', () => {
    const merged = mergeScheduleBlocks([
      day('1', '2026-07-06', 'MATH'),
      day('2', '2026-07-06', 'MATH'),
      day('3', '2026-07-07', 'MATH'),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ startDate: '2026-07-06', endDate: '2026-07-07' });
  });

  it('이미 여러 날짜인 블록(자정 넘김 파생 등)도 그대로 병합 대상이 된다', () => {
    const overnight: ScheduleBlock = {
      id: 'o', category: 'OTHER', startDate: '2026-07-20', endDate: '2026-07-21',
    };
    const merged = mergeScheduleBlocks([overnight, day('1', '2026-07-22', 'OTHER')]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ startDate: '2026-07-20', endDate: '2026-07-22' });
  });

  it('월 경계(7/31→8/1)를 넘어도 연속이면 병합한다', () => {
    const merged = mergeScheduleBlocks([
      day('1', '2026-07-31', 'MATH'),
      day('2', '2026-08-01', 'MATH'),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ startDate: '2026-07-31', endDate: '2026-08-01' });
  });
});
