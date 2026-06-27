import { refundAction } from './actions';

// USE_MOCK 분기를 강제로 타게 한다(mock 경로 검증).
jest.mock('@/mocks/config', () => ({ USE_MOCK: true, isMock: () => true }));

// revalidatePath는 Next 런타임 의존이라 stub.
const revalidatePath = jest.fn();
jest.mock('next/cache', () => ({ revalidatePath: (path: string) => revalidatePath(path) }));

// 액션이 실서버 분기에서 부르는 의존도 안전하게 stub(mock 분기라 호출되진 않음).
jest.mock('@/lib/api', () => ({ serverApi: { post: jest.fn() } }));
jest.mock('crypto', () => ({ randomUUID: () => 'test-uuid' }));

/**
 * mockOrderDetails 참고(검증 기준):
 *  - 2005: PAID · 단건 courseId 1 (refundable: true)
 *  - 2003: PAID · courseId 1(refundable) + courseId 3(refundable:false) 혼합
 *  - 2004: PAID · courseId 0 구독 (refundable: true)
 *  - 2002: REFUNDED · courseId 3 (refundable: false)
 *  - 2001: FAILED · courseId 5 (refundable: false)
 *  - 2006: PAID · courseId 0 구독 (refundable: false, 만료)
 */

describe('refundAction (USE_MOCK)', () => {
  beforeEach(() => {
    revalidatePath.mockClear();
  });

  describe('입력 검증 (error)', () => {
    it('사유가 빈 문자열이면 {ok:false, kind:"error"}를 반환한다', async () => {
      const result = await refundAction(2005, [1], '');
      expect(result).toEqual({ ok: false, kind: 'error' });
    });

    it('사유가 공백만 있으면 {ok:false, kind:"error"}를 반환한다', async () => {
      const result = await refundAction(2005, [1], '   ');
      expect(result).toEqual({ ok: false, kind: 'error' });
    });

    it('courseIds가 빈 배열이면 {ok:false, kind:"error"}를 반환한다', async () => {
      const result = await refundAction(2005, [], '단순 변심');
      expect(result).toEqual({ ok: false, kind: 'error' });
    });

    it('사유와 courseIds가 둘 다 비어 있으면 {ok:false, kind:"error"}를 반환한다', async () => {
      const result = await refundAction(2005, [], '');
      expect(result).toEqual({ ok: false, kind: 'error' });
    });
  });

  describe('환불 성공 (ok:true)', () => {
    it('모든 항목이 refundable인 단건 주문이면 {ok:true}를 반환한다', async () => {
      const result = await refundAction(2005, [1], '단순 변심');
      expect(result).toEqual({ ok: true });
    });

    it('환불 가능 항목만 부분 선택하면(혼합 주문) {ok:true}를 반환한다', async () => {
      // 2003은 courseId 1(가능)+3(불가) 혼합 → 가능한 1만 선택하면 성공
      const result = await refundAction(2003, [1], '단순 변심');
      expect(result).toEqual({ ok: true });
    });

    it('refundable한 구독 주문이면 {ok:true}를 반환한다', async () => {
      const result = await refundAction(2004, [0], '구독 해지');
      expect(result).toEqual({ ok: true });
    });

    it('성공 시 해당 주문 경로로 revalidatePath를 호출한다', async () => {
      await refundAction(2005, [1], '단순 변심');
      expect(revalidatePath).toHaveBeenCalledWith('/orders/2005');
    });

    it('중복 courseId를 전달해도(중복 제거) 성공한다', async () => {
      const result = await refundAction(2005, [1, 1], '단순 변심');
      expect(result).toEqual({ ok: true });
    });
  });

  describe('규칙상 불가 (blocked)', () => {
    it('환불 불가 항목이 포함되면 {ok:false, kind:"blocked"}를 반환한다', async () => {
      // 2003은 courseId 3이 refundable:false → 1,3 함께 선택하면 blocked
      const result = await refundAction(2003, [1, 3], '단순 변심');
      expect(result).toEqual({
        ok: false,
        kind: 'blocked',
        reason: '환불할 수 없는 항목이 포함되어 있어요.',
      });
    });

    it('환불 불가 단일 항목만 선택해도 blocked를 반환한다', async () => {
      const result = await refundAction(2003, [3], '단순 변심');
      expect(result).toEqual({
        ok: false,
        kind: 'blocked',
        reason: '환불할 수 없는 항목이 포함되어 있어요.',
      });
    });

    it('만료된 구독(refundable:false) 환불 요청은 blocked를 반환한다', async () => {
      const result = await refundAction(2006, [0], '구독 해지');
      expect(result).toEqual({
        ok: false,
        kind: 'blocked',
        reason: '환불할 수 없는 항목이 포함되어 있어요.',
      });
    });

    it('주문에 없는 courseId를 포함하면(존재하지 않음) blocked를 반환한다', async () => {
      // 2005에는 courseId 1만 존재 → 999는 매칭 안 됨 → targets.length 불일치
      const result = await refundAction(2005, [1, 999], '단순 변심');
      expect(result).toEqual({
        ok: false,
        kind: 'blocked',
        reason: '환불할 수 없는 항목이 포함되어 있어요.',
      });
    });

    it('PAID가 아닌 주문(REFUNDED)은 blocked를 반환한다', async () => {
      const result = await refundAction(2002, [3], '단순 변심');
      expect(result).toEqual({
        ok: false,
        kind: 'blocked',
        reason: '이미 환불되었거나 환불 대상이 아닌 주문입니다.',
      });
    });

    it('PAID가 아닌 주문(FAILED)은 blocked를 반환한다', async () => {
      const result = await refundAction(2001, [5], '단순 변심');
      expect(result).toEqual({
        ok: false,
        kind: 'blocked',
        reason: '이미 환불되었거나 환불 대상이 아닌 주문입니다.',
      });
    });

    it('blocked일 때는 revalidatePath를 호출하지 않는다', async () => {
      await refundAction(2003, [1, 3], '단순 변심');
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('존재하지 않는 주문 (error)', () => {
    it('주문을 찾을 수 없으면 {ok:false, kind:"error"}를 반환한다', async () => {
      const result = await refundAction(999999, [1], '단순 변심');
      expect(result).toEqual({ ok: false, kind: 'error' });
    });
  });
});
