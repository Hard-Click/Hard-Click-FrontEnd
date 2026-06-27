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

  // 라이브: GET /api/payment/me (MyPaymentHistoryPageResponse) — 라이브 검증 2026-06-26(200).
  // ⚠️ 삭제된 강의 행은 orderId/orderNo/paymentType(+FAILED는 paidAt) null로 내려옴 → 매퍼·카드가 null 가드.
  // 페이지네이션 미적용(첫 page=10건만 표시) — 추후.
  try {
    const res =
      await serverApi.get<MyPaymentHistoryPageResponse>('/api/payment/me');
    if (!res.success || !res.data) return [];
    return res.data.content.map(toPaymentHistory);
  } catch {
    return [];
  }
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
  return {
    orderId,
    orderNo: api.orderNo,
    status: api.status,
    paymentType: isSub ? 'SUBSCRIPTION' : 'COURSE',
    orderedAt: api.orderedAt,
    paidAt: api.paidAt ?? '',
    paymentMethod: '', // BE 미제공 → 페이지가 빈 값이면 행 숨김
    items: (api.items ?? []).map((it) => ({
      courseId: it.courseId,
      title: it.title ?? `강의 #${it.courseId}`, // BE null 폴백
      instructor: '', // BE 미제공 → 컴포넌트가 빈 값이면 숨김
      price: it.price,
      isSubscription: isSub,
      enrollStatus: it.enrollStatus ?? '',
      refundable: it.refundable,
      refundAmount: it.refundAmount,
      refundNote: '', // BE 미제공 → 숨김
      refunded: it.refunded,
    })),
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
