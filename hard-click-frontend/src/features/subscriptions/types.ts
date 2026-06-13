/**
 * 구독 도메인 타입 — UI는 이 타입에만 의존(격리막).
 * 미구독/구독 중을 하나의 통합 뷰로 표현한다.
 */

/** 구독 정보 (미구독·구독 중 통합) */
export interface SubscriptionInfo {
  /** 구독 중 여부 */
  subscribed: boolean;
  /** 플랜명 (예: FLOWN 연간 패스) */
  planName: string;
  /** 혜택 목록 */
  benefits: string[];
  /** 수능일(만료 기준) — YYYY-MM-DD */
  suneungDate: string;
  /** 오늘 → 수능 남은 일수 (미구독 가격 산정 + 구독 중 남은 기간) */
  daysUntilSuneung: number;
  /** 오늘 기준 가격(원) — 미구독 결제 예정액 (= 남은 일수 × 1만원) */
  currentPrice: number;
  /** 결제일 — 구독 중일 때만 (YYYY-MM-DD) */
  paidAt: string | null;
  /** 결제 금액(원) — 구독 중일 때만 */
  paidAmount: number | null;
}
