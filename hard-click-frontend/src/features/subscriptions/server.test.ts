/**
 * subscriptions/server.ts 매퍼 테스트 (getSubscriptionServer).
 * §0.1 회귀: 구독 만료일은 BE me.expiredAt를 써야 하고, 하드코딩 수능일(SUNEUNG_DATE)을
 * 만료일로 쓰지 않는다. private 매핑이라 public getSubscriptionServer를 통해 검증.
 *
 * 라이브 분기 강제:
 *  - @/mocks/config의 isMock()을 false로 stub
 *  - @/lib/api의 serverApi.get을 URL별(me/plan) envelope로 stub
 */

jest.mock('@/mocks/config', () => ({ isMock: () => false, USE_MOCK: false }));
jest.mock('@/lib/api', () => ({ serverApi: { get: jest.fn() } }));

import { serverApi } from '@/lib/api';
import { getSubscriptionServer } from './server';
import { SUNEUNG_DATE } from '@/mocks/subscriptions.mock';

const mockedGet = serverApi.get as jest.Mock;

// GET /api/subscriptions/me 와 /plan 을 URL로 구분해 응답을 갈아끼운다.
function wireMeAndPlan(me: unknown, plan: unknown) {
  mockedGet.mockImplementation((url: string) =>
    url.includes('/me')
      ? Promise.resolve({ success: true, httpStatus: 200, data: me })
      : Promise.resolve({ success: true, httpStatus: 200, data: plan }),
  );
}

const PLAN = {
  planId: 1,
  name: 'FLOWN 연간 패스',
  price: 1_580_000,
  durationDays: 365,
  benefits: ['혜택1'],
};

describe('getSubscriptionServer 매퍼 (라이브)', () => {
  // 시스템 시간 고정(KST 2026-07-14 정오) → 남은기간 파생 계산이 결정적(자정 경계 flaky 제거).
  beforeEach(() => {
    mockedGet.mockReset();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-14T03:00:00Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('구독 중이면 만료일을 BE me.expiredAt로 매핑한다(하드코딩 수능일 아님)', async () => {
    wireMeAndPlan(
      {
        subscribed: true,
        expiredAt: '2027-05-20T00:00:00',
        startedAt: '2026-05-20T00:00:00',
        remainingDays: 300,
        paidAmount: 4_320_000,
      },
      PLAN,
    );

    const info = await getSubscriptionServer();

    expect(info.subscribed).toBe(true);
    expect(info.expiresAt).toBe('2027-05-20'); // BE expiredAt의 날짜부
    expect(info.expiresAt).not.toBe(SUNEUNG_DATE); // 하드코딩 수능일이 아님
  });

  it('suneungDate(미구독 가격 산정용)는 상수로 유지되어 만료일과 분리된다', async () => {
    wireMeAndPlan(
      { subscribed: true, expiredAt: '2027-05-20T00:00:00', remainingDays: 300 },
      PLAN,
    );

    const info = await getSubscriptionServer();

    expect(info.suneungDate).toBe(SUNEUNG_DATE); // 상수 그대로
    expect(info.suneungDate).not.toBe(info.expiresAt); // 만료일과 다른 값
  });

  it('미구독이면 만료일(expiresAt)은 null이다', async () => {
    wireMeAndPlan({ subscribed: false, expiredAt: null }, PLAN);

    const info = await getSubscriptionServer();

    expect(info.subscribed).toBe(false);
    expect(info.expiresAt).toBeNull();
  });

  it('구독 중 결제금액/가격을 BE 값으로, 남은기간은 만료일에서 파생한다', async () => {
    // 남은 기간은 만료일(expiredAt)에서 파생하므로 오늘 기준 상대 만료일로 검증(시간 무관).
    const todayKst = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const expiredIn300 = new Date(
      Date.parse(`${todayKst}T00:00:00Z`) + 300 * 86_400_000,
    )
      .toISOString()
      .slice(0, 10);

    wireMeAndPlan(
      {
        subscribed: true,
        expiredAt: `${expiredIn300}T00:00:00`,
        startedAt: '2026-05-20T00:00:00',
        remainingDays: 999, // BE remainingDays는 이제 안 씀(만료일에서 파생) — stale여도 무관함을 증명
        paidAmount: 4_320_000,
      },
      PLAN,
    );

    const info = await getSubscriptionServer();

    expect(info.paidAmount).toBe(4_320_000);
    expect(info.daysUntilSuneung).toBe(300); // 만료일 기준 파생(BE remainingDays 999 무시)
    expect(info.currentPrice).toBe(1_580_000); // BE plan.price
  });
});
