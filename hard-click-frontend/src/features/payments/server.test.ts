/**
 * payments/server.ts 매퍼 테스트.
 * private normalizeStatus·toPaymentHistory는 export 안 되므로
 * public `getMyPaymentsServer`를 통해 검증한다.
 *
 * 라이브 분기를 강제하기 위해:
 *  - `@/mocks/config`의 isMock()을 false로 stub (mock 분기 회피)
 *  - `@/lib/api`의 serverApi.get을 원하는 envelope로 stub
 */

import type {
  MyPaymentHistoryItem,
  MyPaymentHistoryPageResponse,
} from '@/mocks/payments.mock';

// 라이브 분기 강제 (isMock('payments') === false)
jest.mock('@/mocks/config', () => ({
  isMock: () => false,
  USE_MOCK: false,
}));

// serverApi mock — 테스트마다 get 반환값을 갈아끼운다.
jest.mock('@/lib/api', () => ({
  serverApi: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { serverApi } from '@/lib/api';
import { getMyPaymentsServer } from './server';

const mockedGet = serverApi.get as jest.Mock;

/** 성공 envelope 헬퍼 */
function ok(data: unknown) {
  return { success: true, httpStatus: 200, data };
}

/** content 1건짜리 페이지 응답 헬퍼 */
function pageOf(items: MyPaymentHistoryItem[]): MyPaymentHistoryPageResponse {
  return {
    content: items,
    page: 0,
    size: 10,
    totalElements: items.length,
    totalPages: 1,
    last: true,
  };
}

beforeEach(() => {
  mockedGet.mockReset();
});

describe('getMyPaymentsServer — BE 응답 → UI 계약 매핑 (라이브 분기)', () => {
  it('GET /api/payment/me 를 호출한다', async () => {
    mockedGet.mockResolvedValue(ok(pageOf([])));
    await getMyPaymentsServer();
    expect(mockedGet).toHaveBeenCalledWith('/api/payment/me');
  });

  it('정상 항목을 PaymentHistory 형태로 그대로 매핑한다 (happy path)', async () => {
    const item: MyPaymentHistoryItem = {
      paymentId: 3005,
      orderId: 2005,
      orderNo: 'ORD-20260610-001',
      paymentType: 'COURSE',
      amount: 99000,
      status: 'PAID',
      paidAt: '2026-06-10T14:30:00',
      displayName: '2026 수능 국어 완성반',
    };
    mockedGet.mockResolvedValue(ok(pageOf([item])));

    const result = await getMyPaymentsServer();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      paymentId: 3005,
      orderId: 2005,
      orderNo: 'ORD-20260610-001',
      paymentType: 'COURSE',
      status: 'PAID',
      amount: 99000,
      paidAt: '2026-06-10T14:30:00',
      displayName: '2026 수능 국어 완성반',
    });
  });

  it('여러 항목을 입력 순서 그대로 매핑한다', async () => {
    const items: MyPaymentHistoryItem[] = [
      {
        paymentId: 1,
        orderId: 11,
        orderNo: 'ORD-1',
        paymentType: 'COURSE',
        amount: 1000,
        status: 'PAID',
        paidAt: '2026-01-01T00:00:00',
        displayName: 'A',
      },
      {
        paymentId: 2,
        orderId: 12,
        orderNo: 'SUB-2',
        paymentType: 'SUBSCRIPTION',
        amount: 2000,
        status: 'REFUNDED',
        paidAt: '2026-02-01T00:00:00',
        displayName: 'B',
      },
    ];
    mockedGet.mockResolvedValue(ok(pageOf(items)));

    const result = await getMyPaymentsServer();

    expect(result.map((p) => p.paymentId)).toEqual([1, 2]);
    expect(result.map((p) => p.status)).toEqual(['PAID', 'REFUNDED']);
  });
});

describe('normalizeStatus 회귀 — CANCELLED 철자 정규화', () => {
  it("BE 중복 철자 'CANCELLED' 를 UI 계약 'CANCELED' 로 정규화한다", async () => {
    const item: MyPaymentHistoryItem = {
      paymentId: 9001,
      orderId: 8001,
      orderNo: 'ORD-CANCEL',
      paymentType: 'COURSE',
      amount: 50000,
      status: 'CANCELLED', // ⚠️ 더블 L (BE 중복 철자)
      paidAt: '2026-03-01T10:00:00',
      displayName: '취소된 결제',
    };
    mockedGet.mockResolvedValue(ok(pageOf([item])));

    const result = await getMyPaymentsServer();

    expect(result[0].status).toBe('CANCELED'); // 싱글 L
  });

  it("이미 표준 'CANCELED' 는 그대로 둔다", async () => {
    const item: MyPaymentHistoryItem = {
      paymentId: 9002,
      orderId: 8002,
      orderNo: 'ORD-CANCEL2',
      paymentType: 'COURSE',
      amount: 50000,
      status: 'CANCELED',
      paidAt: '2026-03-02T10:00:00',
      displayName: '취소된 결제2',
    };
    mockedGet.mockResolvedValue(ok(pageOf([item])));

    const result = await getMyPaymentsServer();

    expect(result[0].status).toBe('CANCELED');
  });

  it.each(['PAID', 'REFUNDED', 'FAILED', 'READY'] as const)(
    "'%s' 는 정규화 없이 그대로 매핑한다",
    async (status) => {
      const item: MyPaymentHistoryItem = {
        paymentId: 100,
        orderId: 200,
        orderNo: 'ORD-X',
        paymentType: 'COURSE',
        amount: 1000,
        status,
        paidAt: '2026-01-01T00:00:00',
        displayName: 'X',
      };
      mockedGet.mockResolvedValue(ok(pageOf([item])));

      const result = await getMyPaymentsServer();

      expect(result[0].status).toBe(status);
    },
  );
});

describe('삭제된 강의 행 — null 필드 통과 (가드)', () => {
  it('orderId/orderNo/paymentType 가 null 이어도 null 그대로 통과시킨다', async () => {
    const deletedItem: MyPaymentHistoryItem = {
      paymentId: 7000,
      orderId: null,
      orderNo: null,
      paymentType: null,
      amount: 99000,
      status: 'PAID',
      paidAt: '2026-06-10T14:30:00',
      displayName: '(삭제된 강의)',
    };
    mockedGet.mockResolvedValue(ok(pageOf([deletedItem])));

    const result = await getMyPaymentsServer();

    expect(result[0].orderId).toBeNull();
    expect(result[0].orderNo).toBeNull();
    expect(result[0].paymentType).toBeNull();
    expect(result[0].displayName).toBe('(삭제된 강의)');
    expect(result[0].status).toBe('PAID');
  });

  it('FAILED + paidAt null (실패 행)도 paidAt 을 null 로 통과시킨다', async () => {
    const failedItem: MyPaymentHistoryItem = {
      paymentId: 7001,
      orderId: null,
      orderNo: null,
      paymentType: null,
      amount: 119000,
      status: 'FAILED',
      paidAt: null,
      displayName: '(삭제된 강의)',
    };
    mockedGet.mockResolvedValue(ok(pageOf([failedItem])));

    const result = await getMyPaymentsServer();

    expect(result[0].paidAt).toBeNull();
    expect(result[0].status).toBe('FAILED');
  });
});

describe('폴백 — 실패 응답·빈 데이터·예외', () => {
  it('빈 content 는 빈 배열을 반환한다 (경계값)', async () => {
    mockedGet.mockResolvedValue(ok(pageOf([])));
    expect(await getMyPaymentsServer()).toEqual([]);
  });

  it('success=false 면 빈 배열로 폴백한다', async () => {
    mockedGet.mockResolvedValue({
      success: false,
      httpStatus: 500,
      data: null,
    });
    expect(await getMyPaymentsServer()).toEqual([]);
  });

  it('data 가 null 이면 빈 배열로 폴백한다', async () => {
    mockedGet.mockResolvedValue({ success: true, httpStatus: 200, data: null });
    expect(await getMyPaymentsServer()).toEqual([]);
  });

  it('get 이 throw 하면(네트워크 등) 빈 배열로 폴백한다', async () => {
    mockedGet.mockRejectedValue(new Error('network down'));
    expect(await getMyPaymentsServer()).toEqual([]);
  });
});
