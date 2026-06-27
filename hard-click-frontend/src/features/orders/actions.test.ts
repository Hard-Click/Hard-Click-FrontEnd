/**
 * orders/actions.ts — createCheckoutOrderAction 테스트.
 *
 * 결제 직전 주문 발급 액션. 의존하는 getCheckoutServer(./server)를 jest.mock으로 stub해
 * BE 응답(OrderSummary)을 주입하고, 액션의 순수 로직만 검증한다:
 *  - courseIds 정규화(중복/음수/0/비정수 제거)
 *  - honored 가드(반환 항목 == 요청 선택분일 때만 주문, 불일치=null로 토스 전 차단)
 *  - 빈/유효하지 않은 입력 → null
 *  - amount(finalAmount)·orderName(단건=제목 / 다건="제목 외 N건") 구성
 */
import { getCheckoutServer } from './server';
import { createCheckoutOrderAction } from './actions';
import type { OrderSummary, OrderItem } from './types';

jest.mock('./server', () => ({
  getCheckoutServer: jest.fn(),
}));

const mockGetCheckout = getCheckoutServer as jest.Mock;

/** OrderSummary 생성 헬퍼 — items로 total/final 자동 합산(override 가능) */
function summary(
  items: OrderItem[],
  overrides: Partial<OrderSummary> = {},
): OrderSummary {
  const total = items.reduce((s, i) => s + i.price, 0);
  return {
    orderNo: 'ORD-TEST',
    type: 'course',
    status: 'READY',
    items,
    totalAmount: total,
    finalAmount: total,
    ...overrides,
  };
}

function item(id: number, title: string, price: number): OrderItem {
  return { id, title, subtitle: '', price };
}

beforeEach(() => {
  mockGetCheckout.mockReset();
});

describe('createCheckoutOrderAction — 빈/유효하지 않은 입력', () => {
  it('courseIds가 빈 배열이면 null (getCheckoutServer 호출 안 함)', async () => {
    const result = await createCheckoutOrderAction('course', []);
    expect(result).toBeNull();
    expect(mockGetCheckout).not.toHaveBeenCalled();
  });

  it('courseIds가 배열이 아니면 null', async () => {
    // 런타임 경계(Server Action) 방어 — 타입을 우회해 비배열 주입
    const result = await createCheckoutOrderAction(
      'course',
      null as unknown as number[],
    );
    expect(result).toBeNull();
    expect(mockGetCheckout).not.toHaveBeenCalled();
  });

  it('정규화 후 유효 id가 하나도 없으면(0·음수·비정수만) null', async () => {
    const result = await createCheckoutOrderAction('course', [0, -1, -5, 1.5]);
    expect(result).toBeNull();
    expect(mockGetCheckout).not.toHaveBeenCalled();
  });

  it('getCheckoutServer가 null이면(BE 실패) null', async () => {
    mockGetCheckout.mockResolvedValue(null);
    const result = await createCheckoutOrderAction('course', [1]);
    expect(result).toBeNull();
  });

  it('반환 주문의 items가 비어 있으면 null', async () => {
    mockGetCheckout.mockResolvedValue(summary([]));
    const result = await createCheckoutOrderAction('course', [1]);
    expect(result).toBeNull();
  });
});

describe('createCheckoutOrderAction — courseIds 정규화', () => {
  it('중복 id는 제거하고 단일 id로 취급(단건 경로)', async () => {
    mockGetCheckout.mockResolvedValue(summary([item(7, '수능 국어', 30000)]));

    const result = await createCheckoutOrderAction('course', [7, 7, 7]);

    expect(result).not.toBeNull();
    // 정규화 후 1건 → 단건 경로: courseId=7, courseIds=[7]
    expect(mockGetCheckout).toHaveBeenCalledWith('course', 7, [7], false);
  });

  it('음수·0·비정수를 걸러낸 뒤 유효 id만 전달', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([item(1, 'A', 100), item(2, 'B', 200)]),
    );

    const result = await createCheckoutOrderAction(
      'course',
      [1, -3, 0, 2.5, 2, NaN],
    );

    expect(result).not.toBeNull();
    // 유효 = [1, 2] → 다건 경로: courseId=undefined, courseIds=[1,2]
    expect(mockGetCheckout).toHaveBeenCalledWith('course', undefined, [1, 2], false);
  });

  it('중복 제거 후 단건이면 단건 경로(courseId 지정), 다건이면 courseId=undefined', async () => {
    // 다건: 중복 섞여도 고유 2건이면 다건 경로
    mockGetCheckout.mockResolvedValue(
      summary([item(1, 'A', 100), item(2, 'B', 200)]),
    );
    await createCheckoutOrderAction('course', [1, 2, 1, 2]);
    expect(mockGetCheckout).toHaveBeenCalledWith('course', undefined, [1, 2], false);
  });

  it('필터 발급 차단을 위해 filterToSelection=false로 호출한다', async () => {
    mockGetCheckout.mockResolvedValue(summary([item(5, 'X', 10)]));

    await createCheckoutOrderAction('course', [5]);

    const args = mockGetCheckout.mock.calls[0];
    expect(args[3]).toBe(false); // 네 번째 인자 = filterToSelection
  });
});

describe('createCheckoutOrderAction — honored 가드', () => {
  it('반환 항목 == 요청 선택분이면 주문 반환(honored)', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([item(1, 'A', 100), item(2, 'B', 200)], { orderNo: 'ORD-OK' }),
    );

    const result = await createCheckoutOrderAction('course', [1, 2]);

    expect(result).not.toBeNull();
    expect(result!.orderNo).toBe('ORD-OK');
    expect(result!.courseIds).toEqual([1, 2]);
  });

  it('순서가 달라도 집합이 같으면 honored (정렬 비교)', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([item(2, 'B', 200), item(1, 'A', 100)]),
    );

    const result = await createCheckoutOrderAction('course', [1, 2]);

    expect(result).not.toBeNull();
    // courseIds는 BE 항목 순서 그대로 반환
    expect(result!.courseIds).toEqual([2, 1]);
  });

  it('BE가 전체를 돌려줘 요청보다 많으면 null (부분결제 미지원 차단)', async () => {
    // 요청은 [1,3]인데 BE가 장바구니 전체 [1,2,3] 반환
    mockGetCheckout.mockResolvedValue(
      summary([item(1, 'A', 100), item(2, 'B', 200), item(3, 'C', 300)]),
    );

    const result = await createCheckoutOrderAction('course', [1, 3]);

    expect(result).toBeNull();
  });

  it('항목 수는 같아도 집합이 다르면 null', async () => {
    // 요청 [1,2] vs 반환 [1,9]
    mockGetCheckout.mockResolvedValue(
      summary([item(1, 'A', 100), item(9, 'Z', 900)]),
    );

    const result = await createCheckoutOrderAction('course', [1, 2]);

    expect(result).toBeNull();
  });

  it('반환이 요청보다 적어도(부분) null', async () => {
    // 요청 [1,2,3] vs 반환 [1,2]
    mockGetCheckout.mockResolvedValue(
      summary([item(1, 'A', 100), item(2, 'B', 200)]),
    );

    const result = await createCheckoutOrderAction('course', [1, 2, 3]);

    expect(result).toBeNull();
  });

  it('단건 요청 honored: 같은 1건이면 주문 반환', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([item(42, '수능 수학', 50000)], { orderNo: 'ORD-ONE' }),
    );

    const result = await createCheckoutOrderAction('course', [42]);

    expect(result).not.toBeNull();
    expect(result!.orderNo).toBe('ORD-ONE');
    expect(result!.courseIds).toEqual([42]);
  });
});

describe('createCheckoutOrderAction — amount / orderName 구성', () => {
  it('amount는 finalAmount를 쓴다(totalAmount가 아니라)', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([item(1, 'A', 1000)], { totalAmount: 1000, finalAmount: 800 }),
    );

    const result = await createCheckoutOrderAction('course', [1]);

    expect(result!.amount).toBe(800); // 할인 반영된 최종금액
  });

  it('단건이면 orderName = 그 강의 제목', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([item(1, '수능 영어 완성', 40000)]),
    );

    const result = await createCheckoutOrderAction('course', [1]);

    expect(result!.orderName).toBe('수능 영어 완성');
  });

  it('다건이면 orderName = "첫 제목 외 N건"', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([
        item(1, '수능 국어', 30000),
        item(2, '수능 수학', 50000),
        item(3, '수능 영어', 40000),
      ]),
    );

    const result = await createCheckoutOrderAction('course', [1, 2, 3]);

    expect(result!.orderName).toBe('수능 국어 외 2건'); // 3건 → 첫 + 외 2건
  });

  it('2건이면 "첫 제목 외 1건"', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([item(1, 'A 강의', 100), item(2, 'B 강의', 200)]),
    );

    const result = await createCheckoutOrderAction('course', [1, 2]);

    expect(result!.orderName).toBe('A 강의 외 1건');
  });

  it('반환 결과의 모든 필드(orderNo·amount·orderName·courseIds)를 구성', async () => {
    mockGetCheckout.mockResolvedValue(
      summary([item(10, '강의 X', 12000), item(20, '강의 Y', 8000)], {
        orderNo: 'ORD-FULL',
        finalAmount: 20000,
      }),
    );

    const result = await createCheckoutOrderAction('course', [10, 20]);

    expect(result).toEqual({
      orderNo: 'ORD-FULL',
      amount: 20000,
      orderName: '강의 X 외 1건',
      courseIds: [10, 20],
    });
  });
});
