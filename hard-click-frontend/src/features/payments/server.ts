import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import {
  mockMyPayments,
  mockOrderDetails,
  type MyPaymentHistoryItem,
  type MyPaymentHistoryPageResponse,
  type ApiOrderDetail,
} from '@/mocks/payments.mock';
import type { OrderDetail, PaymentHistory, PaymentStatus } from './types';

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
  if (USE_MOCK) {
    return mockMyPayments.content.map(toPaymentHistory);
  }

  // TODO(API 연동): GET /api/payment/me (MyPaymentHistoryPageResponse). 페이지네이션 추후.
  const res =
    await serverApi.get<MyPaymentHistoryPageResponse>('/api/payment/me');
  if (!res.success || !res.data) return [];
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
 * 주문 상세 조회 (Server Component 전용). orderId 단건 조회, 없으면 null(→notFound).
 */
export async function getOrderDetailServer(
  orderId: number,
): Promise<OrderDetail | null> {
  if (USE_MOCK) {
    const found = mockOrderDetails.find((o) => o.orderId === orderId);
    return found ? toOrderDetail(found) : null;
  }

  // TODO(API 연동): GET /api/order/{orderId} (BE 상세 엔드포인트 추가 시 매퍼만 맞추면 됨)
  const res = await serverApi.get<ApiOrderDetail>(`/api/order/${orderId}`);
  if (!res.success || !res.data) return null;
  return toOrderDetail(res.data);
}
