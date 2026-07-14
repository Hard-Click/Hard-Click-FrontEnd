/**
 * 구독 남은 기간(일) — 만료일(expiredAt)에서 직접 계산.
 *
 * ⚠️ BE `/me`의 `remainingDays`를 그대로 쓰지 않는 이유: 환불 시 BE가 `expiredAt`은 당일로 당기면서도
 *    `remainingDays`는 원래 값(예: 365)을 그대로 줘서 화면이 어긋난다(만료일=오늘인데 "남은 기간 365일").
 *    남은 기간을 **표시되는 만료일(expiredAt)에서 파생**하면 만료일 카드와 항상 일치한다(단일 소스).
 *
 * 날짜만(YYYY-MM-DD) 기준, 한국시간(KST)으로 계산. 만료일이 오늘이거나 지났으면 0.
 */
export function subscriptionRemainingDays(
  expiredAt: string | null | undefined,
): number {
  if (!expiredAt) return 0;
  const MS_PER_DAY = 86_400_000;
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const todayKst = new Date(Date.now() + KST_OFFSET).toISOString().slice(0, 10);
  const from = Date.parse(`${todayKst}T00:00:00Z`);
  const to = Date.parse(`${expiredAt.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / MS_PER_DAY));
}
