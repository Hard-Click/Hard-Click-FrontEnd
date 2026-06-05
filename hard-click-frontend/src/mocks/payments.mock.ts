/**
 * 결제 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/payments/me
 */

export interface PaymentApiItem {
  paymentId: number;
  orderId: number;
  paidAmount: number; // 결제 금액(원)
  paymentMethod: string; // CARD 등
  status: 'COMPLETED' | 'REFUNDED';
  paidAt: string;
}

export interface PaymentListApiResponse {
  content: PaymentApiItem[];
  totalPages: number;
}

export const mockPaymentListResponse: PaymentListApiResponse = {
  content: [
    {
      paymentId: 9001,
      orderId: 500,
      paidAmount: 168000,
      paymentMethod: 'CARD',
      status: 'COMPLETED',
      paidAt: '2026-05-10T17:30:00',
    },
    {
      paymentId: 9000,
      orderId: 499,
      paidAmount: 89000,
      paymentMethod: 'CARD',
      status: 'REFUNDED',
      paidAt: '2026-04-28T11:10:00',
    },
  ],
  totalPages: 1,
};
