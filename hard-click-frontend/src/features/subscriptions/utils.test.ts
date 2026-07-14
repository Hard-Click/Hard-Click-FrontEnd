import { subscriptionRemainingDays } from './utils';

// 오늘(KST) 기준 상대 날짜 — 실행 시각과 무관하게 결정적으로 검증.
const KST_OFFSET = 9 * 60 * 60 * 1000;
const todayKst = new Date(Date.now() + KST_OFFSET).toISOString().slice(0, 10);
const plusDays = (d: number): string =>
  new Date(Date.parse(`${todayKst}T00:00:00Z`) + d * 86_400_000)
    .toISOString()
    .slice(0, 10);

describe('subscriptionRemainingDays (만료일 기준 남은 일수)', () => {
  it('만료일이 오늘+365면 365', () => {
    expect(subscriptionRemainingDays(plusDays(365))).toBe(365);
  });

  it('만료일이 오늘이면 0 (환불 후 "오늘까지" 표시용)', () => {
    expect(subscriptionRemainingDays(plusDays(0))).toBe(0);
  });

  it('만료일이 지났으면 0 (음수 아님)', () => {
    expect(subscriptionRemainingDays(plusDays(-5))).toBe(0);
  });

  it('ISO 타임스탬프(T 포함)도 날짜만 잘라 계산', () => {
    expect(subscriptionRemainingDays(`${plusDays(10)}T23:59:59`)).toBe(10);
  });

  it('null·빈 문자열·잘못된 값은 0', () => {
    expect(subscriptionRemainingDays(null)).toBe(0);
    expect(subscriptionRemainingDays(undefined)).toBe(0);
    expect(subscriptionRemainingDays('')).toBe(0);
    expect(subscriptionRemainingDays('not-a-date')).toBe(0);
  });
});
