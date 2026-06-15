/** 결제 관리(관리자) 도메인 타입 — GET /api/admin/payments (연동 대비 영문 enum) */

export type AdminPaymentType = 'COURSE' | 'SUBSCRIPTION';
export type AdminPaymentStatus = 'PAID' | 'REFUNDED' | 'FAILED';

/** 백엔드 응답 항목 (API 타입) */
export interface AdminPaymentApiItem {
  paymentId: number;
  orderNo: string;
  type: AdminPaymentType;
  userName: string;
  userEmail: string;
  productName: string; // 강의명 또는 구독 플랜명
  amount: number;
  method: string; // 결제수단 (예: Toss)
  status: AdminPaymentStatus;
  paidAt: string; // 결제 일시
}

export interface AdminPaymentListApiResponse {
  content: AdminPaymentApiItem[];
  totalPages: number;
}

/** UI 표시용 결제 타입 */
export interface AdminPayment {
  paymentId: number;
  orderNo: string;
  type: AdminPaymentType;
  userName: string;
  userEmail: string;
  productName: string;
  amount: number;
  method: string;
  status: AdminPaymentStatus;
  paidAt: string;
}

/** 결제 구분 필터 (전체 ALL 포함) */
export type AdminPaymentTypeFilter = AdminPaymentType | 'ALL';

/** 백엔드 응답 → UI 타입 변환 */
export function toAdminPayment(api: AdminPaymentApiItem): AdminPayment {
  return {
    paymentId: api.paymentId,
    orderNo: api.orderNo,
    type: api.type,
    userName: api.userName,
    userEmail: api.userEmail,
    productName: api.productName,
    amount: api.amount,
    method: api.method,
    status: api.status,
    paidAt: api.paidAt,
  };
}
