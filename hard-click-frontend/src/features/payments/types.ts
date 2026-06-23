/**
 * 결제 내역 도메인 타입 — UI는 이 타입에만 의존(격리막).
 * 실제 백엔드 `GET /api/payment/me`(MyPaymentHistoryResponse) 기준.
 */

export type PaymentType = 'COURSE' | 'SUBSCRIPTION';

/** 결제 상태 — 완료/환불완료/실패/대기/취소 */
export type PaymentStatus =
  | 'PAID'
  | 'REFUNDED'
  | 'FAILED'
  | 'READY'
  | 'CANCELED';

/** 결제 내역 1건 (UI 계약) */
export interface PaymentHistory {
  /** 결제 식별자 */
  paymentId: number;
  /** 주문 식별자(상세 이동용) */
  orderId: number;
  /** 주문번호 — 예: ORD-20260610-001 / SUB-20260520-001 */
  orderNo: string;
  /** 결제 유형 — 단건 강의 / 구독 */
  paymentType: PaymentType;
  /** 결제 상태 */
  status: PaymentStatus;
  /** 결제 금액(원) */
  amount: number;
  /** 결제 일시(ISO LocalDateTime) — 예: 2026-06-10T14:30:00 */
  paidAt: string;
  /** 표시명 — 강의명(복수면 ", "로 연결) 또는 구독 플랜명 */
  displayName: string;
}

/* ── 주문 상세 (order detail) ── */

/** 주문 상태 — 결제완료/환불완료/결제실패 */
export type OrderStatus = 'PAID' | 'REFUNDED' | 'FAILED';

/** 주문 상세의 항목 1개 */
export interface OrderDetailItem {
  courseId: number;
  /** 강의명 또는 구독 플랜명 */
  title: string;
  /** 강사명 (구독은 빈 문자열) */
  instructor: string;
  /** 결제 금액(원) */
  price: number;
  /** 구독 상품 여부 — "구독 상품" 뱃지 */
  isSubscription: boolean;
  /** 수강 상태 — 예: "수강중" / "수강취소" */
  enrollStatus: string;
  /** 이 항목 환불 가능 여부 — 진도율은 강의별이라 항목 단위(7일 이내 + 진도율 10% 미만 / 구독 미만료) */
  refundable: boolean;
  /** 이 항목 환불 예상액(원) — 단건 전액 / 구독 비례 */
  refundAmount: number;
  /** 환불 안내 — 예: "진도율 4% · 결제 5일 경과" / "남은 157일 비례 환불" */
  refundNote: string;
}

/** 주문 상세 (UI 계약) */
export interface OrderDetail {
  orderId: number;
  orderNo: string;
  status: OrderStatus;
  paymentType: PaymentType;
  /** 주문 일시(ISO) */
  orderedAt: string;
  /** 결제 일시(ISO) */
  paidAt: string;
  /** 결제 수단 — 예: "신용카드" */
  paymentMethod: string;
  items: OrderDetailItem[];
  /** 총 결제금액(원) */
  totalAmount: number;
  /** 환불 가능 조건 안내 문구 */
  refundConditionNote: string;
}

/** 환불 요청 결과 — 성공 / 규칙상 불가(모달) / 처리 오류(토스트) */
export type RefundResult =
  | { ok: true }
  | { ok: false; kind: 'blocked'; reason: string }
  | { ok: false; kind: 'error' };

/* ── 결제 승인 (Toss 결제 후 백엔드 confirm) ── */

/**
 * 결제 최종 승인 입력 — 토스 successUrl 쿼리(`paymentKey`/`orderId`/`amount`) + 강의 식별자.
 * (BE `PaymentConfirmRequest`는 OpenAPI상 courseId/amount만이지만 실제론 paymentKey도 사용)
 */
export interface PaymentConfirmInput {
  paymentKey: string;
  orderId: string;
  amount: number;
  courseId: number;
}

/** 백엔드 결제 승인 응답 data (`PaymentConfirmResponse`) */
export interface PaymentConfirmResponseData {
  status: string;
  pgTransactionId: string;
  duplicate: boolean;
}

/** 결제 승인 결과 (UI 계약) */
export interface PaymentConfirmResult {
  success: boolean;
  message: string;
  status?: string;
  duplicate?: boolean;
}
