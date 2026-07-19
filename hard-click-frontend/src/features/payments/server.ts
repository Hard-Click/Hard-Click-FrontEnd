import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import {
  mockMyPayments,
  mockOrderDetails,
  type MyPaymentHistoryItem,
  type MyPaymentHistoryPageResponse,
  type ApiOrderDetail,
} from '@/mocks/payments.mock';
import type {
  OrderDetail,
  OrderStatus,
  PaymentType,
  PaymentHistory,
  PaymentStatus,
} from './types';

/** BE 상태(중복 철자 CANCELLED 포함)를 UI 계약 상태로 정규화 */
function normalizeStatus(s: MyPaymentHistoryItem['status']): PaymentStatus {
  if (s === 'CANCELLED') return 'CANCELED';
  return s;
}

/** BE 응답 → UI 계약 매퍼(격리막) */
function toPaymentHistory(api: MyPaymentHistoryItem): PaymentHistory {
  return {
    paymentId: api.paymentId,
    orderId: api.orderId,
    orderNo: api.orderNo,
    paymentType: api.paymentType,
    status: normalizeStatus(api.status),
    amount: api.amount,
    paidAt: api.paidAt,
    displayName: api.displayName,
  };
}

/**
 * 내 결제 내역 조회 (Server Component 전용).
 * 단건·구독 결제 내역을 최신순으로 반환. API 연동 시 엔드포인트/매퍼만 맞추면 됨.
 */
export async function getMyPaymentsServer(): Promise<PaymentHistory[]> {
  if (isMock('payments')) {
    return mockMyPayments.content.map(toPaymentHistory);
  }

  // 라이브: GET /api/payments/me (MyPaymentHistoryPageResponse).
  // ⚠️ BE가 결제 경로를 복수(/api/payments/*)로 통일(2026-06-29 main) — 단수 /api/payment/me는 500(C002)이라
  //    결제내역(강의·구독) 전체가 안 뜨던 버그. confirm(/api/payments/confirm)과 경로 체계 일치. 라이브 검증: 복수 200.
  // ⚠️ 삭제된 강의 행은 orderId/orderNo/paymentType(+FAILED는 paidAt) null로 내려옴 → 매퍼·카드가 null 가드.
  // 페이지네이션 미적용(첫 page=10건만 표시) — 추후.
  const res =
    await serverApi.get<MyPaymentHistoryPageResponse>('/api/payments/me');
  // 실패를 '결제 내역 없음'으로 위장하지 않는다(§0.1④) — 결제한 사용자가 내역을 못 보는 오인·문의 방지.
  //   /orders 페이지가 catch 없이 호출 → error.tsx로 노출. (serverApi는 4xx/5xx에 throw 없이 {success:false})
  if (!res.success || !res.data) {
    throw new Error(`결제 내역 조회 실패 (${res.httpStatus}): ${res.message}`);
  }
  return res.data.content.map(toPaymentHistory);
}

/** BE 주문 상세 → UI 계약 매퍼(격리막) */
function toOrderDetail(api: ApiOrderDetail): OrderDetail {
  return {
    orderId: api.orderId,
    orderNo: api.orderNo,
    status: api.status,
    paymentType: api.paymentType,
    orderedAt: api.orderedAt,
    paidAt: api.paidAt,
    paymentMethod: api.paymentMethod,
    items: api.items.map((it) => ({ ...it })),
    totalAmount: api.totalAmount,
    refundConditionNote: api.refundConditionNote,
  };
}

/**
 * 라이브 BE 주문 상세 응답 — GET /api/order/{orderId} (라이브 검증 2026-06-27, 200 복구).
 * ⚠️ orderId·paymentMethod·refundConditionNote·item.instructor·item.refundNote는 BE 미제공 → 폴백/숨김.
 *    item.title이 null로 오기도 함(시드) → 폴백. (§0.1: 허위 데이터 대신 폴백/정적 문구)
 */
interface BeOrderDetail {
  orderNo: string;
  status: OrderStatus; // READY/PAID/PARTIAL_REFUNDED/REFUNDED/CANCELED
  paymentType: PaymentType; // COURSE | SUBSCRIPTION
  orderedAt: string;
  paidAt: string | null;
  totalAmount: number;
  items: {
    courseId: number;
    title: string | null;
    thumbnailUrl: string | null;
    price: number;
    refundable: boolean;
    refundAmount: number;
    refunded: boolean;
    enrollStatus: string;
  }[];
}

/** 라이브 BE 주문 상세 → UI 계약. BE 미제공 필드는 폴백/숨김, orderId는 URL 파라미터로 보강. */
function toLiveOrderDetail(api: BeOrderDetail, orderId: number): OrderDetail {
  const isSub = String(api.paymentType).toUpperCase() === 'SUBSCRIPTION';
  const items = (api.items ?? []).map((it) => ({
    courseId: it.courseId,
    title: it.title ?? `강의 #${it.courseId}`, // BE null 폴백
    instructor: '', // BE 미제공 → 컴포넌트가 빈 값이면 숨김
    thumbnailUrl: it.thumbnailUrl ?? undefined, // BE 제공(2026-06-28 추가) → 있으면 이미지, 없으면 placeholder
    price: it.price,
    isSubscription: isSub,
    enrollStatus: it.enrollStatus ?? '',
    refundable: it.refundable,
    refundAmount: it.refundAmount,
    refundNote: '', // BE 미제공 → 숨김
    refunded: it.refunded,
  }));
  // 구독 주문상세: BE(GetOrderService)가 구독 item을 합성해 refundAmount=min(현재가,결제액)=실제 환불식으로
  //   내려주므로(#581), 그 값을 그대로 매핑해 표시하면 실제 환불액과 일치한다(같은 날 기준). 구독 환불은
  //   POST /api/order/{id}/refund(주문 단위)로 정상 동작.
  //   아래 합성은 BE가 item을 안 주는 예외의 last-resort 폴백(금액=totalAmount 근사치, 통상 미실행).
  if (isSub && items.length === 0) {
    items.push({
      courseId: 0,
      title: 'FLOWN 구독권',
      instructor: '',
      thumbnailUrl: undefined, // 구독은 sparkle 박스 — 썸네일 없음
      price: api.totalAmount,
      isSubscription: true,
      enrollStatus: '',
      refundable: true,
      refundAmount: api.totalAmount, // 폴백 = 결제 전액(비례 아님)
      refundAmountEstimated: true, // 전액 추정 → OrderRefundView가 '오늘 기준 일할' 단정 안 함(§0.1②)
      refundNote: '',
      refunded: false,
    });
  }
  return {
    orderId,
    orderNo: api.orderNo,
    status: api.status,
    paymentType: isSub ? 'SUBSCRIPTION' : 'COURSE',
    orderedAt: api.orderedAt,
    paidAt: api.paidAt ?? '',
    paymentMethod: '', // BE 미제공 → 페이지가 빈 값이면 행 숨김
    items,
    totalAmount: api.totalAmount,
    // BE 미제공 → 정적 정책 문구(허위 데이터 아님)
    refundConditionNote:
      '결제 후 7일 이내, 강의 진도율 10% 미만일 때 환불 가능합니다.',
  };
}

/**
 * 주문 상세 조회 (Server Component 전용). orderId 단건 조회, 없으면 null(→notFound).
 * 라이브: GET /api/order/{orderId} (BE order/{id} 200 복구, 2026-06-27).
 * ⚠️ 시드 데이터가 부실(status=READY·금액 0·title null·refundable=false)할 수 있음 — BE 환불가능 PAID 주문 시드 대기.
 */
export async function getOrderDetailServer(
  orderId: number,
): Promise<OrderDetail | null> {
  if (isMock('payments')) {
    const found = mockOrderDetails.find((o) => o.orderId === orderId);
    return found ? toOrderDetail(found) : null;
  }
  try {
    const res = await serverApi.get<BeOrderDetail>(`/api/order/${orderId}`);
    if (!res.success || !res.data) return null;
    return toLiveOrderDetail(res.data, orderId);
  } catch {
    return null;
  }
}
