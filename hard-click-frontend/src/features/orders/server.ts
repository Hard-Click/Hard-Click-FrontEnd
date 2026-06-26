import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { mockCart } from '@/mocks/cart.mock';
import { mockCourseListResponse } from '@/mocks/courses.mock';
import type { OrderSummary, OrderType } from './types';

/** 데모용 주문번호 (FORCE_ALL_MOCK 프리뷰 전용 — 라이브는 BE가 발급) */
const MOCK_ORDER_NO = 'ORD-20260614-001';

/**
 * ⚠️ 구독 mock 가격 — FORCE_ALL_MOCK 프리뷰 전용. 라이브는 BE가 plan.price를 내려준다.
 */
const SUNEUNG_DATE = Date.UTC(2026, 10, 19); // 2026-11-19 (2027학년도 수능)
const PLAN_NAME = 'FLOWN 연간 패스';
function subscriptionPriceToday(): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.max(0, Math.round((SUNEUNG_DATE - today) / 86400000));
  return days * 10000;
}

/**
 * 백엔드 주문 응답 — GET /api/order/checkout (라이브 검증 2026-06-25).
 * 단건/장바구니: type="COURSE", items=[{courseId,title,price}] / 구독: type="SUBSCRIPTION", items[0].courseId=null.
 * ⚠️ 주문 응답엔 강사명(instructorName)이 없다(BE 미제공) → subtitle은 빈 값.
 */
interface ApiOrder {
  orderNo: string;
  type: string; // "COURSE" | "SUBSCRIPTION"
  status: string; // "READY"
  items: { courseId: number | null; title: string; price: number }[];
  totalAmount: number;
  finalAmount: number;
}

function toOrderSummary(api: ApiOrder): OrderSummary {
  const isSubscription = api.type.toUpperCase() === 'SUBSCRIPTION';
  return {
    orderNo: api.orderNo,
    type: isSubscription ? 'subscription' : 'course',
    status: 'READY',
    items: api.items.map((i) => ({
      id: i.courseId ?? 0, // 구독은 courseId=null → 0
      title: i.title,
      // 구독은 고정 라벨(BE 무관), 강의는 주문 응답에 강사명이 없어(BE 미제공) 빈 값 → 렌더 측에서 빈 값이면 숨김.
      subtitle: isSubscription ? '이용 기간: 1년' : '',
      price: i.price,
    })),
    totalAmount: api.totalAmount,
    finalAmount: api.finalAmount,
  };
}

/** 단건 강의 주문 — mock 전용(FORCE_ALL_MOCK 프리뷰). 라이브는 /api/order/checkout이 처리. */
function getSingleCourseOrderMock(courseId: number): OrderSummary | null {
  const c = mockCourseListResponse.content.find((x) => x.courseId === courseId);
  if (!c || c.priceType === 'FREE' || c.price <= 0) return null;
  return {
    orderNo: `${MOCK_ORDER_NO}-${courseId}`,
    type: 'course',
    status: 'READY',
    items: [
      { id: courseId, title: c.title, subtitle: c.instructorName, price: c.price },
    ],
    totalAmount: c.price,
    finalAmount: c.price,
  };
}

/**
 * 주문/결제 정보 조회 (Server Component 전용).
 *
 * 라이브: GET /api/order/checkout?type=<course|subscription>[&courseId=N]
 *   - type=course + courseId → 단건 강의 / courseId 생략 → 장바구니 전체 / type=subscription → 연간 패스
 *   - ⭐ BE가 **실 orderNo를 발급**한다. 이게 토스 orderId로 쓰여 결제 후 `/api/payments/confirm`이
 *     이 orderNo로 주문을 검증·승인한다. (이전엔 FE가 orderNo를 조작해서 confirm이 C001로 실패했음 — 수정)
 * mock(FORCE_ALL_MOCK 프리뷰)일 때만 아래 mock 분기.
 */
export async function getCheckoutServer(
  type: OrderType,
  courseId?: number,
  courseIds?: number[],
): Promise<OrderSummary | null> {
  if (!isMock('orders')) {
    const params = new URLSearchParams({ type });
    if (type === 'course' && courseId) params.set('courseId', String(courseId));
    // ⚠️ 가정(BE 요청 中): 장바구니 선택분 결제 — courseIds 리스트 지원 시 선택분만 주문 발급.
    //   BE 미지원이면 이 파라미터를 무시 → 장바구니 전체 주문 반환(graceful, 깨지지 않음).
    if (type === 'course' && courseIds && courseIds.length > 0) {
      params.set('courseIds', courseIds.join(','));
    }
    const res = await serverApi.get<ApiOrder>(
      `/api/order/checkout?${params.toString()}`,
    );
    if (!res.success || !res.data) return null;
    const summary = toOrderSummary(res.data);

    // ⚠️ BE가 courseIds를 무시하고 장바구니 전체를 돌려주는 경우(BE 요청 中) 대비:
    //   선택분만 클라에서 거른다 → 체크아웃 표시·금액이 "장바구니에서 고른 것"과 일치.
    //   (BE가 courseIds를 지원하면 이미 선택분만 와서 no-op.)
    //   orderNo는 BE 발급분이라, BE 미지원 시 결제 confirm은 금액 불일치로 실패할 수 있음
    //   (= 선택 안 한 항목까지 과금되는 사고는 막힘 — 라이브 완성은 BE courseIds 지원 후).
    if (type === 'course' && courseIds && courseIds.length > 0) {
      const wanted = new Set(courseIds);
      const picked = summary.items.filter((it) => wanted.has(it.id));
      if (picked.length === 0) return null;
      const total = picked.reduce((sum, it) => sum + it.price, 0);
      return { ...summary, items: picked, totalAmount: total, finalAmount: total };
    }

    return summary.items.length > 0 ? summary : null;
  }

  // ── mock (FORCE_ALL_MOCK 프리뷰 전용) ──
  if (type === 'course' && courseId) return getSingleCourseOrderMock(courseId);
  if (type === 'subscription') {
    const price = subscriptionPriceToday();
    return {
      orderNo: MOCK_ORDER_NO,
      type: 'subscription',
      status: 'READY',
      items: [{ id: 0, title: PLAN_NAME, subtitle: '이용 기간: 1년', price }],
      totalAmount: price,
      finalAmount: price,
    };
  }
  const items = mockCart.items
    // courseIds가 오면 선택분만(프리뷰 일관성), 없으면 장바구니 전체
    .filter(
      (it) =>
        !courseIds || courseIds.length === 0 || courseIds.includes(it.courseId),
    )
    .map((it) => ({
      id: it.courseId,
      title: it.courseTitle,
      subtitle: it.instructorName,
      price: it.price,
    }));
  if (items.length === 0) return null;
  const total = items.reduce((sum, it) => sum + it.price, 0);
  return {
    orderNo: MOCK_ORDER_NO,
    type: 'course',
    status: 'READY',
    items,
    totalAmount: total,
    finalAmount: total,
  };
}
