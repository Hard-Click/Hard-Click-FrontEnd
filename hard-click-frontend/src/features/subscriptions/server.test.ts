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
  beforeEach(() => mockedGet.mockReset());

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

  it('구독 중 결제금액/남은기간/가격을 BE 값으로 매핑한다', async () => {
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

    expect(info.paidAmount).toBe(4_320_000);
    expect(info.daysUntilSuneung).toBe(300); // 구독 중엔 BE remainingDays
    expect(info.currentPrice).toBe(1_580_000); // BE plan.price
  });
});
