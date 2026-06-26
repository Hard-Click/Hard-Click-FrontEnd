/** 결제 관리(관리자) 도메인 타입 — GET /api/admin/payments */

export type AdminPaymentType = 'COURSE' | 'SUBSCRIPTION';
export type AdminPaymentStatus =
  | 'PAID'
  | 'REFUNDED'
  | 'FAILED'
  | 'PENDING'
  | 'READY'
  | 'CANCELED';

/** 백엔드 응답 항목 (API 타입) */
export interface AdminPaymentApiItem {
  paymentId: number;
  orderNo: string;
  paymentType: AdminPaymentType;
  memberName: string;
  memberEmail: string;
  amount: number;
  paymentMethod: string;
  status: AdminPaymentStatus;
  paidAt: string;
  refundable: boolean;
}

export interface AdminPaymentListApiResponse {
  content: AdminPaymentApiItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** UI 표시용 결제 타입 */
export interface AdminPayment {
  paymentId: number;
  orderNo: string;
  paymentType: AdminPaymentType;
  memberName: string;
  memberEmail: string;
  amount: number;
  paymentMethod: string;
  status: AdminPaymentStatus;
  paidAt: string;
  refundable: boolean;
}

/** 결제 구분 필터 (전체 ALL 포함) */
export type AdminPaymentTypeFilter = AdminPaymentType | 'ALL';

/** 백엔드 응답 → UI 타입 변환 */
export function toAdminPayment(api: AdminPaymentApiItem): AdminPayment {
  return {
    paymentId: api.paymentId,
    orderNo: api.orderNo,
    paymentType: api.paymentType,
    memberName: api.memberName,
    memberEmail: api.memberEmail,
    amount: api.amount,
    paymentMethod: api.paymentMethod,
    status: api.status,
    paidAt: api.paidAt?.replace('T', ' ').slice(0, 16) ?? api.paidAt,
    refundable: api.refundable,
  };
}
