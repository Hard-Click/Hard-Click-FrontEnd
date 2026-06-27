'use server';

import { getCheckoutServer } from './server';
import type { OrderType } from './types';

/**
 * 결제 직전 주문 생성 (Server Action) — 현재 선택분(courseIds)으로 BE 주문(orderNo)을 발급한다.
 *
 * 체크아웃에서 선택을 바꿔도 **결제 시점의 선택분**으로 orderNo가 맞춰져야
 * 토스 결제금액(amount)과 주문 총액이 일치한다(불일치 시 confirm 실패).
 *
 * ⚠️ 가정(BE 요청 中): 장바구니 선택분 결제 — `/api/order/checkout`이 `courseIds` 리스트를
 *   받는다는 전제. BE 미지원 시 courseIds가 무시돼 장바구니 전체 주문이 발급될 수 있음(graceful).
 */
export async function createCheckoutOrderAction(
  type: OrderType,
  courseIds: number[],
): Promise<{
  orderNo: string;
  amount: number;
  orderName: string;
  /** 실제 주문에 담긴 강의들 — successUrl·수강등록은 요청값이 아닌 이 값을 쓴다 */
  courseIds: number[];
} | null> {
  if (!Array.isArray(courseIds) || courseIds.length === 0) return null;
  const safe = [...new Set(courseIds)].filter(
    (n) => Number.isInteger(n) && n > 0,
  );
  if (safe.length === 0) return null;

  // 단건이면 courseId 경로(검증된 라이브), 다건이면 courseIds 경로(가정) — server가 URL 구성.
  // 결제 발급이므로 filterToSelection=false → BE 원본을 받아 honor 여부를 직접 검증한다.
  const order = await getCheckoutServer(
    type,
    safe.length === 1 ? safe[0] : undefined,
    safe,
    false,
  );
  // 'blocked'(이미 수강 중)이면 주문 발급 불가 → null(결제 진행 차단). 페이지가 선차단하므로 보통 여기 안 옴.
  if (!order || 'blocked' in order || order.items.length === 0) return null;

  // BE가 courseIds(복수)를 무시하고 장바구니 전체를 돌려주면 부분 선택결제가 불가능하다.
  // 발급된 주문의 강의 집합이 요청 선택분과 정확히 일치할 때만 진행 → 아니면 null로 토스 전에 차단.
  // (PaymentButton이 null이면 "주문 생성 실패"로 막아 과금 시도/늦은 confirm 실패를 방지.
  //  단건은 courseId 경로를 BE가 honor하므로 일치, BE가 courseIds를 지원하면 다건도 일치한다.)
  const returnedIds = order.items.map((i) => i.id).sort((a, b) => a - b);
  const requestedIds = [...safe].sort((a, b) => a - b);
  const honored =
    returnedIds.length === requestedIds.length &&
    returnedIds.every((id, i) => id === requestedIds[i]);
  if (!honored) return null;

  const orderName =
    order.items.length === 1
      ? order.items[0].title
      : `${order.items[0].title} 외 ${order.items.length - 1}건`;
  return {
    orderNo: order.orderNo,
    amount: order.finalAmount,
    orderName,
    courseIds: order.items.map((i) => i.id),
  };
}
