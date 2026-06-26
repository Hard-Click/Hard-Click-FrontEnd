/**
 * 구독 도메인 목 데이터 — FLOWN 연간 패스 (단일 플랜).
 *
 * 💰 가격 모델: 수능일까지 "남은 일수 × 10,000원/일" (매일 1만원씩 감소).
 *    - 만료일 = 수능일 (수능까지 이용)
 *    - 최대 365만원(수능 ~1년 전) → 수능 가까울수록 저렴
 *    - 연동 시 BE가 currentPrice를 서버에서 계산해 내려주는 게 정석(여기선 mock 계산).
 */

/** 2027학년도 수능일 (2026-11-19, 목) — 만료일·D-day·가격 기준점 */
export const SUNEUNG_DATE = '2026-11-19';

/** 1일당 가격(원) */
export const PRICE_PER_DAY = 10000;

/** 플랜명 */
export const PLAN_NAME = 'FLOWN 연간 패스';

/** 혜택 목록 (디자인 5개 순서대로) */
export const SUBSCRIPTION_BENEFITS: string[] = [
  '모든 유료 강의 수강 가능',
  '신규 강의 추가 시 자동 이용 가능',
  '학습 진도율 저장',
  '퀴즈 응시 가능',
  '마이페이지 학습 통계 반영',
];

/** 두 날짜 사이 일수(to - from, 자정 UTC 기준). 음수면 0으로 보정 */
function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.round((b - a) / MS_PER_DAY));
}

/** 기준일(기본 오늘)로부터 특정 날짜(YYYY-MM-DD)까지 남은 일수 */
export function daysUntil(dateStr: string, from: Date = new Date()): number {
  return daysBetween(from, new Date(dateStr));
}

/** 기준일(기본 오늘)로부터 수능일까지 남은 일수 */
export function daysUntilSuneung(from: Date = new Date()): number {
  return daysUntil(SUNEUNG_DATE, from);
}

/** 기준일(기본 오늘) 가격 = 남은 일수 × 1만원 */
export function priceOn(from: Date = new Date()): number {
  return daysUntilSuneung(from) * PRICE_PER_DAY;
}

/** 백엔드 구독 상태 응답(가정) — 격리막 */
export interface SubscriptionStatusApi {
  subscribed: boolean;
  planName: string;
  paidAt: string | null; // 결제일 (YYYY-MM-DD)
  expiresAt: string | null; // 만료일 (= 수능일)
  paidAmount: number | null; // 결제 시점 가격(원)
}

/**
 * 데모용 본인 구독 상태.
 * `subscribed`를 true로 바꾸면 "구독 중" 화면, false면 "미구독" 화면.
 * 구독 중 데모: 2026-05-20 결제(그 시점 가격), 만료일 = 수능일.
 */
export const mockSubscriptionStatus: SubscriptionStatusApi = {
  subscribed: false,
  planName: PLAN_NAME,
  paidAt: '2026-05-20',
  expiresAt: SUNEUNG_DATE,
  paidAmount: priceOn(new Date('2026-05-20')), // 결제 시점(D-day) 가격
};
