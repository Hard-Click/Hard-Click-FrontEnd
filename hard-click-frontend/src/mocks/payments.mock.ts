/**
 * 결제 도메인 목 데이터 — 실제 백엔드 코드(Hard-Click-BackEnd) DTO 기준.
 * GET /api/payment/me  (※ 단수 'payment')
 *   → MyPaymentHistoryPageResponse { content[], page, size, totalElements, totalPages, last }
 *   item: MyPaymentHistoryResponse
 *
 * ⚠️ 노션 명세(/api/payments/me, paidAmount/paymentMethod)와 다름 — 실제 코드 기준으로 정렬함.
 */

export type PaymentType = 'COURSE' | 'SUBSCRIPTION';
export type PaymentStatus =
  | 'PAID'
  | 'REFUNDED'
  | 'READY'
  | 'FAILED'
  | 'CANCELED'
  | 'CANCELLED';

export interface MyPaymentHistoryItem {
  paymentId: number;
  orderId: number;
  orderNo: string;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  paidAt: string; // LocalDateTime
  displayName: string; // 강의명 또는 구독 플랜명
}

export interface MyPaymentHistoryPageResponse {
  content: MyPaymentHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const mockMyPayments: MyPaymentHistoryPageResponse = {
  content: [
    {
      paymentId: 3001,
      orderId: 2001,
      orderNo: 'ORD-20260425-002',
      paymentType: 'COURSE',
      amount: 99000,
      status: 'PAID',
      paidAt: '2026-04-25T09:15:00',
      displayName: 'TypeScript 심화 학습, Node.js 백엔드 개발',
    },
    {
      paymentId: 3002,
      orderId: 2002,
      orderNo: 'SUB-20260501-001',
      paymentType: 'SUBSCRIPTION',
      amount: 19900,
      status: 'PAID',
      paidAt: '2026-05-01T09:00:00',
      displayName: '프리미엄 월간 플랜',
    },
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1,
  last: true,
};
