import { subscriptionRemainingDays } from './utils';

// 시스템 시간을 KST 2026-07-14 정오로 고정 → todayKst='2026-07-14' 결정적(자정 경계 flaky 제거).
// 03:00Z + KST(+9h) = 2026-07-14 12:00 KST.
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-07-14T03:00:00Z'));
});
afterEach(() => {
  jest.useRealTimers();
});

describe('subscriptionRemainingDays (만료일 기준 남은 일수)', () => {
  it('만료일이 오늘+365면 365', () => {
    expect(subscriptionRemainingDays('2027-07-14')).toBe(365);
  });

  it('만료일이 오늘이면 0 (환불 후 "오늘까지" 표시용)', () => {
    expect(subscriptionRemainingDays('2026-07-14')).toBe(0);
  });

  it('만료일이 지났으면 0 (음수 아님)', () => {
    expect(subscriptionRemainingDays('2026-07-09')).toBe(0);
  });

  it('ISO 타임스탬프(T 포함)도 날짜만 잘라 계산', () => {
    expect(subscriptionRemainingDays('2026-07-24T23:59:59')).toBe(10);
  });

  it('null·빈 문자열·잘못된 값은 0', () => {
    expect(subscriptionRemainingDays(null)).toBe(0);
    expect(subscriptionRemainingDays(undefined)).toBe(0);
    expect(subscriptionRemainingDays('')).toBe(0);
    expect(subscriptionRemainingDays('not-a-date')).toBe(0);
  });
});
