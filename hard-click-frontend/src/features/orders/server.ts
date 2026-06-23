import { serverApi } from '@/lib/api';
import { USE_MOCK, isMock } from '@/mocks/config';
import { mockCart } from '@/mocks/cart.mock';
import { mockCourseListResponse } from '@/mocks/courses.mock';
import type { CourseDetailApiResponse } from '@/features/courses/types';
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
  items: { id: number; title: string; subtitle: string; price: number }[];
  totalAmount: number;
  finalAmount: number;
}

function toOrderSummary(api: ApiOrder): OrderSummary {
  return {
    orderNo: api.orderNo,
    type: api.type,
    status: api.status,
    items: api.items.map((i) => ({
      id: i.id,
      title: i.title,
      subtitle: i.subtitle,
      price: i.price,
    })),
    totalAmount: api.totalAmount,
    finalAmount: api.finalAmount,
  };
}

/**
 * 단건 강의 주문 (유료 수강신청 → 결제). 강의 1개를 그대로 주문 1건으로 만든다.
 * 강의 정보는 라이브 `/api/courses/{id}`(courses 도메인 연동분)에서 가져온다.
 * orderNo는 토스 orderId 겸 표시번호로 사용 — 매 진입 고유(중복 결제 방지).
 */
async function getSingleCourseOrder(
  courseId: number,
): Promise<OrderSummary | null> {
  let title: string;
  let instructorName: string;
  let price: number;
  let isFree: boolean;

  if (isMock('courses')) {
    const c = mockCourseListResponse.content.find((x) => x.courseId === courseId);
    if (!c) return null;
    title = c.title;
    instructorName = c.instructorName;
    price = c.price;
    isFree = c.priceType === 'FREE';
  } else {
    const res = await serverApi.get<CourseDetailApiResponse>(
      `/api/courses/${courseId}`,
    );
    if (!res.success || !res.data) return null;
    title = res.data.title;
    instructorName = res.data.instructorName;
    price = res.data.price;
    isFree = res.data.priceType === 'FREE';
  }

  // 무료 강의는 결제 대상이 아님 (수강신청에서 즉시 처리) — 방어
  if (isFree || price <= 0) return null;

  const orderNo = `ORD-${courseId}-${Date.now()}`;
  return {
    orderNo,
    type: 'course',
    status: 'READY',
    items: [{ id: courseId, title, subtitle: instructorName, price }],
    totalAmount: price,
    finalAmount: price,
  };
}

/**
 * 주문/결제 정보 조회 (Server Component 전용).
 * - type=course + courseId → 단건 강의(유료 수강신청 결제)
 * - type=course (courseId 없음) → 장바구니 선택분 합계(mock — cart BE 미구현)
 * - type=subscription → FLOWN 연간 패스(수능 D-day 동적 가격, mock — subscription BE 미구현)
 */
export async function getCheckoutServer(
  type: OrderType,
  courseId?: number,
): Promise<OrderSummary | null> {
  // 단건 강의 결제 — 유료 수강신청에서 진입
  if (type === 'course' && courseId) {
    return getSingleCourseOrder(courseId);
  }

  if (USE_MOCK) {
    if (type === 'subscription') {
      const price = subscriptionPriceToday();
      return {
        orderNo: MOCK_ORDER_NO,
        type: 'subscription',
        status: 'READY',
        // id 0 = 구독 단일 플랜(mock; 연동 시 BE가 플랜 id 발급)
        items: [{ id: 0, title: PLAN_NAME, subtitle: '이용 기간: 1년', price }],
        totalAmount: price,
        finalAmount: price,
      };
    }
    // course — 장바구니 선택분
    const items = mockCart.items.map((it) => ({
      id: it.courseId,
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
