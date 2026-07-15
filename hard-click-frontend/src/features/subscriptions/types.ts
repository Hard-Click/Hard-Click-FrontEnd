/**
 * 구독 도메인 타입 — UI는 이 타입에만 의존(격리막).
 * 미구독/구독 중을 하나의 통합 뷰로 표현한다.
 */

/** 구독 정보 (미구독·구독 중 통합) */
export interface SubscriptionInfo {
  /** 구독 중 여부 */
  subscribed: boolean;
  /**
   * 구독 상태 조회 성공 여부. false면 BE 조회 실패로 상태가 **불명**이다.
   * 페이지는 이때 subscribed(=false)를 '미구독'으로 렌더하면 안 된다(구독자 재결제 위험, §0.1④) — 에러 안내로 처리.
   */
  statusKnown: boolean;
  /** 플랜명 (예: FLOWN 연간 패스) */
  planName: string;
  /** 혜택 목록 */
  benefits: string[];
  /** 수능일 — 미구독 mock 가격(D-day) 산정용. ⚠️ 실제 만료일은 expiresAt (수능일 아님). YYYY-MM-DD */
  suneungDate: string;
  /**
   * 표시용 남은 일수 — 상태에 따라 두 의미로 오버로드.
   *  - 미구독: 오늘 → 수능 남은 일수 (mock D-day 가격 산정용)
   *  - 구독 중: 만료일(expiresAt)까지 남은 일수 (SubscriptionStatusCard "남은 기간", 0이면 "오늘까지")
   */
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
