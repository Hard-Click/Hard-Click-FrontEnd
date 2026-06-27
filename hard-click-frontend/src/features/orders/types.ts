/**
 * 주문/결제 도메인 타입 — UI는 이 타입에만 의존(격리막).
 * 단건 강의 / 구독을 하나의 주문 요약으로 표현(동시 결제 없음).
 */

export type OrderType = 'course' | 'subscription';

export interface OrderItem {
  /** 상품 식별자 — 강의는 courseId, 구독은 플랜 id (BE 매핑·React key용) */
  id: number;
  /** 강의명 또는 상품명 */
  title: string;
  /** 강사명(단건) 또는 이용 안내(구독) */
  subtitle: string;
  /** 가격(원) */
  price: number;
}

export interface OrderSummary {
  /** 주문번호 */
  orderNo: string;
  /** 주문 유형 — 단건 강의 / 구독 */
  type: OrderType;
  /** 주문 상태 — 결제 대기(READY) */
  status: 'READY';
  /** 주문 상품 목록 */
  items: OrderItem[];
  /** 총 상품금액(원) */
  totalAmount: number;
  /** 최종 결제금액(원) */
  finalAmount: number;
}

/**
 * 체크아웃 차단 — BE가 주문 발급을 거부한 경우.
 * `ALREADY_ENROLLED`: 이미 수강 중인 강의가 포함됨(BE 409 EN001) → 이중결제 방지. (라이브 확인 2026-06-27)
 */
export interface CheckoutBlocked {
  blocked: 'ALREADY_ENROLLED';
}
