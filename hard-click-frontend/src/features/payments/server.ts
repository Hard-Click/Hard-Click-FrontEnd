import { serverApi } from '@/lib/api';
import { USE_MOCK, isMock } from '@/mocks/config';
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
 * 주문 상세 조회 (Server Component 전용). orderId 단건 조회, 없으면 null(→notFound).
 */
export async function getOrderDetailServer(
  orderId: number,
): Promise<OrderDetail | null> {
  // ⚠️ BE GET /api/order/{orderId}가 C001(400, OrderStatus enum 버그)로 깨져 있어 라이브 불가
  //    → mock 유지(USE_MOCK). OrderDetailResponse에 환불/per-item 필드도 없어 환불 UI 데이터원도 부재.
  //    BE 수정 후 isMock('payments') 전환 + ApiOrderDetail 매퍼 정합 필요. (라이브 재확인 2026-06-26)
  if (USE_MOCK) {
    const found = mockOrderDetails.find((o) => o.orderId === orderId);
    return found ? toOrderDetail(found) : null;
  }

  // (BE order/{id} 수정 후) 라이브: GET /api/order/{orderId}
  try {
    const res = await serverApi.get<ApiOrderDetail>(`/api/order/${orderId}`);
    if (!res.success || !res.data) return null;
    return toOrderDetail(res.data);
  } catch {
    return null;
  }
}
