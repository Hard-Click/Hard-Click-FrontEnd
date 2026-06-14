import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import { mockCart } from '@/mocks/cart.mock';
import type { OrderSummary, OrderType } from './types';

/** 데모용 주문번호 (연동 시 BE가 발급) */
const MOCK_ORDER_NO = 'ORD-20260614-001';

/**
 * ⚠️ 임시: 구독권(#356)이 develop에 미머지라 `subscriptions.mock`의 `priceOn`/`PLAN_NAME`을
 * 쓸 수 없어 인라인으로 둠. #356 머지 후 그 모듈로 통합할 것.
 * (실서버 연동 시엔 BE가 주문 금액을 내려주므로 이 계산은 mock 전용)
 */
const SUNEUNG_DATE = Date.UTC(2026, 10, 19); // 2026-11-19 (2027학년도 수능)
const PLAN_NAME = 'FLOWN 연간 패스';
function subscriptionPriceToday(): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.max(0, Math.round((SUNEUNG_DATE - today) / 86400000));
  return days * 10000; // 남은 일수 × 1만원/일
}

/** 백엔드 주문 응답(가정) — 격리막 */
interface ApiOrder {
  orderNo: string;
  type: OrderType;
  status: 'READY';
  items: { title: string; subtitle: string; price: number }[];
  totalAmount: number;
  finalAmount: number;
}

function toOrderSummary(api: ApiOrder): OrderSummary {
  return {
    orderNo: api.orderNo,
    type: api.type,
    status: api.status,
    items: api.items.map((i) => ({
      title: i.title,
      subtitle: i.subtitle,
      price: i.price,
    })),
    totalAmount: api.totalAmount,
    finalAmount: api.finalAmount,
  };
}

/**
 * 주문/결제 정보 조회 (Server Component 전용).
 * - type=course → 장바구니 선택분 합계
 * - type=subscription → FLOWN 연간 패스(수능 D-day 동적 가격)
 * 단건/구독 동시 결제 없음. API 연동 시: 엔드포인트 + ApiOrder/매퍼만 맞추면 됨.
 */
export async function getCheckoutServer(
  type: OrderType,
): Promise<OrderSummary | null> {
  if (USE_MOCK) {
    if (type === 'subscription') {
      const price = subscriptionPriceToday();
      return {
        orderNo: MOCK_ORDER_NO,
        type: 'subscription',
        status: 'READY',
        items: [{ title: PLAN_NAME, subtitle: '이용 기간: 1년', price }],
        totalAmount: price,
        finalAmount: price,
      };
    }
    // course — 장바구니 선택분
    const items = mockCart.items.map((it) => ({
      title: it.courseTitle,
      subtitle: it.instructorName,
      price: it.price,
    }));
    if (items.length === 0) return null;
    return {
      orderNo: MOCK_ORDER_NO,
      type: 'course',
      status: 'READY',
      items,
      totalAmount: mockCart.totalPrice,
      finalAmount: mockCart.totalPrice,
    };
  }

  // TODO(API 연동): 주문/결제 정보 조회
  const res = await serverApi.get<ApiOrder>(`/api/order/checkout?type=${type}`);
  if (!res.success || !res.data) return null;
  return toOrderSummary(res.data);
}
