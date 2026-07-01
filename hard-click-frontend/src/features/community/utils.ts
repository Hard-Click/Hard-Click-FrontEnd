/**
 * 서버 timestamp 문자열을 Date로 파싱한다.
 *
 * ⚠️ 백엔드 버그 워크어라운드: BE가 **UTC 벽시계 시각**을 내려주면서
 * 타임존을 (1) 아예 안 붙이거나 (2) 잘못된 `+09:00` offset으로 붙인다.
 * 예) 실제 UTC 02:43인데 `2026-07-01T02:43:45+09:00`로 내려줌 → 그대로 믿으면 9시간 과거.
 * → 어느 경우든 벽시계 값은 항상 UTC이므로, 타임존 지정자를 떼고 UTC(`Z`)로 파싱한다.
 * (BE가 offset을 올바르게 고치면 이 함수의 strip 로직을 제거해야 함)
 */
export function parseServerDate(isoString: string): Date {
  const wallClock = isoString.replace(/(?:[zZ]|[+-]\d{2}:?\d{2})$/, '');
  return new Date(`${wallClock}Z`);
}

/** ISO 문자열을 상대 시간(방금 전 / N분 전 / N시간 전 / N일 전)으로 포맷한다. */
export function formatDate(isoString: string): string {
  const date = parseServerDate(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}
