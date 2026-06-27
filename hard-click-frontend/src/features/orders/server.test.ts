/**
 * orders/server.ts 라이브 분기 테스트.
 *
 * toOrderSummary는 export되지 않은 private 매퍼라 직접 호출하지 않고
 * public getCheckoutServer를 통해 검증한다.
 *  - @/mocks/config를 라이브(isMock=false)로 강제해 실서버 분기를 타게 하고,
 *  - @/lib/api의 serverApi.get을 원하는 envelope({success,httpStatus,data})로 stub해
 *    BE 응답(ApiOrder)을 주입한 뒤 매핑 결과(OrderSummary)를 검증한다.
 */
import { serverApi } from '@/lib/api';
import { getCheckoutServer } from './server';

// 라이브 분기 강제 (isMock('orders') === false)
jest.mock('@/mocks/config', () => ({
  isMock: () => false,
  USE_MOCK: false,
}));

// serverApi.get을 테스트마다 원하는 envelope으로 stub
jest.mock('@/lib/api', () => ({
  serverApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockGet = serverApi.get as jest.Mock;

/** 성공 envelope 헬퍼 (BE 봉투 모양 그대로) */
function ok<T>(data: T) {
  return { success: true, httpStatus: 200, message: 'OK', data };
}
/** 실패 envelope 헬퍼 */
function fail() {
  return { success: false, httpStatus: 500, message: 'ERR', data: null };
}

beforeEach(() => {
  mockGet.mockReset();
});

describe('getCheckoutServer — toOrderSummary 매핑 (라이브)', () => {
  it('구독 주문: items[].courseId=null이면 id=0, subtitle은 고정 라벨, type=subscription', async () => {
    mockGet.mockResolvedValue(
      ok({
        orderNo: 'ORD-1',
        type: 'SUBSCRIPTION',
        status: 'READY',
        items: [{ courseId: null, title: 'FLOWN 연간 패스', price: 1580000 }],
        totalAmount: 1580000,
        finalAmount: 1580000,
      }),
    );

    const result = await getCheckoutServer('subscription');

    expect(result).not.toBeNull();
    expect(result!.type).toBe('subscription');
    expect(result!.orderNo).toBe('ORD-1');
    expect(result!.status).toBe('READY');
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0].id).toBe(0); // courseId=null → 0
    expect(result!.items[0].subtitle).toBe('이용 기간: 1년'); // 구독 고정 라벨
    expect(result!.items[0].price).toBe(1580000);
    expect(result!.totalAmount).toBe(1580000);
    expect(result!.finalAmount).toBe(1580000);
  });

  it('강의 주문: subtitle은 빈 값(BE가 강사명 미제공), id는 courseId 그대로', async () => {
    mockGet.mockResolvedValue(
      ok({
        orderNo: 'ORD-2',
        type: 'COURSE',
        status: 'READY',
        items: [{ courseId: 42, title: '수능 수학', price: 50000 }],
        totalAmount: 50000,
        finalAmount: 50000,
      }),
    );

    const result = await getCheckoutServer('course', 42);

    expect(result).not.toBeNull();
    expect(result!.type).toBe('course');
    expect(result!.items[0].id).toBe(42); // courseId 그대로
    expect(result!.items[0].subtitle).toBe(''); // 강의는 빈 값
    expect(result!.items[0].title).toBe('수능 수학');
  });

  it('type 대소문자 무관(소문자 subscription도 구독으로 인식)', async () => {
    mockGet.mockResolvedValue(
      ok({
        orderNo: 'ORD-3',
        type: 'subscription', // 소문자
        status: 'READY',
        items: [{ courseId: null, title: '연간 패스', price: 1000 }],
        totalAmount: 1000,
        finalAmount: 1000,
      }),
    );

    const result = await getCheckoutServer('subscription');

    expect(result!.type).toBe('subscription');
    expect(result!.items[0].id).toBe(0);
    expect(result!.items[0].subtitle).toBe('이용 기간: 1년');
  });

  it('여러 강의 항목을 모두 매핑(subtitle 전부 빈 값)', async () => {
    mockGet.mockResolvedValue(
      ok({
        orderNo: 'ORD-4',
        type: 'COURSE',
        status: 'READY',
        items: [
          { courseId: 1, title: 'A', price: 100 },
          { courseId: 2, title: 'B', price: 200 },
        ],
        totalAmount: 300,
        finalAmount: 300,
      }),
    );

    const result = await getCheckoutServer('course');

    expect(result!.items.map((i) => i.id)).toEqual([1, 2]);
    expect(result!.items.every((i) => i.subtitle === '')).toBe(true);
    expect(result!.totalAmount).toBe(300);
  });
});

describe('getCheckoutServer — 폴백 (라이브)', () => {
  it('응답 success=false면 null', async () => {
    mockGet.mockResolvedValue(fail());
    expect(await getCheckoutServer('course')).toBeNull();
  });

  it('응답 data=null이면 null', async () => {
    mockGet.mockResolvedValue({ success: true, httpStatus: 200, data: null });
    expect(await getCheckoutServer('course')).toBeNull();
  });

  it('items가 빈 배열이면 null (표시할 게 없음)', async () => {
    mockGet.mockResolvedValue(
      ok({
        orderNo: 'ORD-EMPTY',
        type: 'COURSE',
        status: 'READY',
        items: [],
        totalAmount: 0,
        finalAmount: 0,
      }),
    );
    expect(await getCheckoutServer('course')).toBeNull();
  });
});

describe('getCheckoutServer — courseIds 표시필터 (filterToSelection)', () => {
  /** BE가 courseIds를 무시하고 장바구니 전체를 돌려주는 시나리오 */
  function wholeCartResponse() {
    return ok({
      orderNo: 'ORD-CART',
      type: 'COURSE',
      status: 'READY',
      items: [
        { courseId: 1, title: 'A', price: 100 },
        { courseId: 2, title: 'B', price: 200 },
        { courseId: 3, title: 'C', price: 300 },
      ],
      totalAmount: 600,
      finalAmount: 600,
    });
  }

  it('filterToSelection=true(기본): 선택분만 남기고 total/final 재계산', async () => {
    mockGet.mockResolvedValue(wholeCartResponse());

    const result = await getCheckoutServer('course', undefined, [1, 3]);

    expect(result!.items.map((i) => i.id)).toEqual([1, 3]);
    expect(result!.totalAmount).toBe(400); // 100 + 300
    expect(result!.finalAmount).toBe(400); // 재계산됨 (원본 600 아님)
    expect(result!.orderNo).toBe('ORD-CART'); // orderNo는 보존
  });

  it('선택 1건만 골라도 그 항목/금액만', async () => {
    mockGet.mockResolvedValue(wholeCartResponse());

    const result = await getCheckoutServer('course', undefined, [2]);

    expect(result!.items).toHaveLength(1);
    expect(result!.items[0].id).toBe(2);
    expect(result!.totalAmount).toBe(200);
    expect(result!.finalAmount).toBe(200);
  });

  it('선택분이 응답에 하나도 없으면 null', async () => {
    mockGet.mockResolvedValue(wholeCartResponse());

    const result = await getCheckoutServer('course', undefined, [999]);

    expect(result).toBeNull();
  });

  it('filterToSelection=false: BE 원본 그대로 (필터/재계산 안 함)', async () => {
    mockGet.mockResolvedValue(wholeCartResponse());

    const result = await getCheckoutServer('course', undefined, [1, 3], false);

    expect(result!.items.map((i) => i.id)).toEqual([1, 2, 3]); // 전체 보존
    expect(result!.totalAmount).toBe(600); // 원본 유지
    expect(result!.finalAmount).toBe(600);
  });

  it('courseIds 빈 배열이면 필터 미적용(전체 반환)', async () => {
    mockGet.mockResolvedValue(wholeCartResponse());

    const result = await getCheckoutServer('course', undefined, []);

    expect(result!.items).toHaveLength(3);
    expect(result!.totalAmount).toBe(600);
  });

  it('courseIds 미전달이면 필터 미적용(전체 반환)', async () => {
    mockGet.mockResolvedValue(wholeCartResponse());

    const result = await getCheckoutServer('course');

    expect(result!.items).toHaveLength(3);
    expect(result!.totalAmount).toBe(600);
  });

  it('type=subscription이면 courseIds 있어도 필터 미적용', async () => {
    mockGet.mockResolvedValue(
      ok({
        orderNo: 'ORD-SUB',
        type: 'SUBSCRIPTION',
        status: 'READY',
        items: [{ courseId: null, title: '연간 패스', price: 1000 }],
        totalAmount: 1000,
        finalAmount: 1000,
      }),
    );

    const result = await getCheckoutServer('subscription', undefined, [1, 2]);

    expect(result!.type).toBe('subscription');
    expect(result!.items).toHaveLength(1);
    expect(result!.totalAmount).toBe(1000);
  });

  it('요청 URL에 courseIds 파라미터가 join되어 들어간다', async () => {
    mockGet.mockResolvedValue(wholeCartResponse());

    await getCheckoutServer('course', undefined, [1, 3]);

    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toContain('type=course');
    expect(calledUrl).toContain('courseIds=1%2C3'); // "1,3" URL 인코딩
  });

  it('단건(courseId)이면 URL에 courseId 파라미터가 들어간다', async () => {
    mockGet.mockResolvedValue(
      ok({
        orderNo: 'ORD-S',
        type: 'COURSE',
        status: 'READY',
        items: [{ courseId: 7, title: 'X', price: 10 }],
        totalAmount: 10,
        finalAmount: 10,
      }),
    );

    await getCheckoutServer('course', 7);

    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toContain('courseId=7');
  });
});
