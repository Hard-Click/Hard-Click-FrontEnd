/**
 * refundAction 라이브 "구독 환불" 분기 테스트.
 * 기존 actions.test.ts는 USE_MOCK=true(mock 분기)만 검증하므로,
 * 여기선 USE_MOCK=false로 라이브 분기를 강제해 isSubscription 경로를 검증한다.
 *  - 구독은 order-level POST /api/order/{orderId}/refund 를 호출(per-item 아님)
 *  - 400/409 → blocked, 그 외 실패 → error
 *  - 실 환불 호출은 파괴적이라 라이브 미실행 — serverApi.post를 stub해 계약만 검증
 */

// 라이브 분기 강제 (isMock('payments') === false)
jest.mock('@/mocks/config', () => ({ USE_MOCK: false, isMock: () => false }));

// revalidatePath stub (Next 런타임 의존)
const revalidatePath = jest.fn();
jest.mock('next/cache', () => ({
  revalidatePath: (path: string) => revalidatePath(path),
}));

// serverApi.post stub — 반환 envelope를 테스트마다 갈아끼운다.
jest.mock('@/lib/api', () => ({ serverApi: { post: jest.fn() } }));
// Idempotency-Key 헤더 검증을 위해 randomUUID 고정.
jest.mock('crypto', () => ({ randomUUID: () => 'test-uuid' }));

import { serverApi } from '@/lib/api';
import { refundAction } from './actions';

const mockedPost = serverApi.post as jest.Mock;

describe('refundAction — 라이브 구독 환불(isSubscription)', () => {
  beforeEach(() => {
    mockedPost.mockReset();
    revalidatePath.mockClear();
  });

  it('order-level POST /api/order/{id}/refund 를 호출하고 per-item 경로는 부르지 않는다', async () => {
    mockedPost.mockResolvedValue({ success: true, httpStatus: 200 });

    const result = await refundAction(201, [0], '구독 해지', true);

    expect(result).toEqual({ ok: true });
    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith('/api/order/201/refund', undefined, {
      'Idempotency-Key': 'test-uuid',
    });
    // 합성 courseId=0이 per-item(/items/0/refund)으로 새지 않아야 한다
    expect(mockedPost).not.toHaveBeenCalledWith(
      expect.stringContaining('/items/'),
      expect.anything(),
      expect.anything(),
    );
  });

  it('성공 시 /orders/{id} 와 /subscriptions 를 revalidate 한다', async () => {
    mockedPost.mockResolvedValue({ success: true, httpStatus: 200 });

    await refundAction(201, [0], '구독 해지', true);

    expect(revalidatePath).toHaveBeenCalledWith('/orders/201');
    expect(revalidatePath).toHaveBeenCalledWith('/subscriptions');
  });

  it('409(환불 불가 상태)면 {ok:false, kind:"blocked"} 를 반환한다', async () => {
    mockedPost.mockResolvedValue({ success: false, httpStatus: 409 });

    const result = await refundAction(201, [0], '구독 해지', true);

    expect(result).toEqual({
      ok: false,
      kind: 'blocked',
      reason: '환불 조건을 충족하지 않아요.',
    });
  });

  it('400(잘못된 멱등키 등)도 blocked 로 안내한다', async () => {
    mockedPost.mockResolvedValue({ success: false, httpStatus: 400 });

    const result = await refundAction(201, [0], '구독 해지', true);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ kind: 'blocked' });
  });

  it('500(처리 오류)이면 {ok:false, kind:"error"} 를 반환한다', async () => {
    mockedPost.mockResolvedValue({ success: false, httpStatus: 500 });

    const result = await refundAction(201, [0], '구독 해지', true);

    expect(result).toEqual({ ok: false, kind: 'error' });
  });

  it('실패 시에는 revalidatePath 를 호출하지 않는다', async () => {
    mockedPost.mockResolvedValue({ success: false, httpStatus: 409 });

    await refundAction(201, [0], '구독 해지', true);

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('강의 환불(isSubscription=false)은 per-item 경로를 호출한다(회귀)', async () => {
    mockedPost.mockResolvedValue({ success: true, httpStatus: 200 });

    await refundAction(101, [1], '단순 변심', false);

    expect(mockedPost).toHaveBeenCalledWith(
      '/api/order/101/items/1/refund',
      undefined,
      { 'Idempotency-Key': 'test-uuid' },
    );
  });
});
