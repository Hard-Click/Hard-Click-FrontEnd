/**
 * getMonthCalendarWeeks 날짜 계산 엣지케이스 — 월 경계(연도 롤오버) · 윤년 · 1일이 일/토요일인 달.
 */
import { getMonthCalendarWeeks, formatMonthTitle } from './utils';

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
