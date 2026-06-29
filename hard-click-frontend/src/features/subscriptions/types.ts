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
  /** 수능일 — 미구독 mock 가격(D-day) 산정용. ⚠️ 실제 만료일은 expiresAt (수능일 아님). YYYY-MM-DD */
  suneungDate: string;
  /** 오늘 → 수능 남은 일수 (미구독 mock 가격 산정용) */
  daysUntilSuneung: number;
  /** 오늘 기준 가격(원) — 미구독 결제 예정액 */
  currentPrice: number;
  /** 결제일 — 구독 중일 때만 (YYYY-MM-DD) */
  paidAt: string | null;
  /** 결제 금액(원) — 구독 중일 때만 */
  paidAmount: number | null;
  /** 실제 구독 만료일 — 구독 중일 때만 (YYYY-MM-DD). BE me.expiredAt(결제일+구독기간) */
  expiresAt: string | null;
}
