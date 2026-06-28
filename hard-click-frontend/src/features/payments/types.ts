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
  /** 주문 식별자(상세 이동용) — 삭제된 강의 결제는 null(상세 이동 불가) */
  orderId: number | null;
  /** 주문번호 — 예: ORD-20260610-001 / SUB-20260520-001 (삭제 행은 null) */
  orderNo: string | null;
  /** 결제 유형 — 단건 강의 / 구독 (삭제 행은 null) */
  paymentType: PaymentType | null;
  /** 결제 상태 */
  status: PaymentStatus;
  /** 결제 금액(원) */
  amount: number;
  /** 결제 일시(ISO LocalDateTime) — 예: 2026-06-10T14:30:00 (실패/삭제 행은 null) */
  paidAt: string | null;
  /** 표시명 — 강의명(복수면 ", "로 연결) 또는 구독 플랜명 */
  displayName: string;
}

/* ── 주문 상세 (order detail) ── */

/** 주문 상태 — BE OrderStatus enum 그대로(READY 결제대기·PARTIAL_REFUNDED 부분환불·CANCELED 취소 포함) */
export type OrderStatus =
  | 'READY'
  | 'PAID'
  | 'PARTIAL_REFUNDED'
  | 'REFUNDED'
  | 'FAILED'
  | 'CANCELED';

/** 주문 상세의 항목 1개 */
export interface OrderDetailItem {
  courseId: number;
  /** 강의명 또는 구독 플랜명 */
  title: string;
  /** 강사명 (구독은 빈 문자열) */
  instructor: string;
  /** 강의 썸네일 URL — BE 제공. 없으면 그라데이션 placeholder, 구독은 sparkle 박스. */
  thumbnailUrl?: string;
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
  /** 이미 환불된 항목 여부(부분환불 표시용) — BE 제공, mock은 미설정 */
  refunded?: boolean;
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
 * 결제 최종 승인 입력 — 토스 successUrl 쿼리(`paymentKey`/`orderId`/`amount`) + 등록할 강의들.
 * BE `/api/payments/confirm`은 `{paymentKey, orderId, amount}`(orderId 기반)만 받고, courseIds는
 * 승인 성공 후 FE가 `/api/enrollments`로 각각 수강 등록하는 데 쓴다(confirm 바디엔 미포함).
 */
export interface PaymentConfirmInput {
  paymentKey: string;
  orderId: string;
  amount: number;
  /** 결제 후 수강 등록할 강의들 — 단건이면 1개, 장바구니면 선택분 전체 */
  courseIds: number[];
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
  /** 결제는 됐으나 일부 강의 수강 등록이 실패한 경우 안내(결과 화면에 노출) */
  enrollWarning?: string;
}
