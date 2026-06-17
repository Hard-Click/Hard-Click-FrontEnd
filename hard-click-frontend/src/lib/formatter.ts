/** 공용 표시 포매터 모음 */

/**
 * 이름 마스킹 — 가운데 글자를 `*`로 가린다. (개인정보 보호)
 * 첫·끝 글자만 노출해 식별 정보를 최소화한다.
 *
 * - 1글자: 그대로 (가릴 가운데 없음)
 * - 2글자: 끝 글자 마스킹 (예: 김민 → 김*)
 * - 3글자 이상: 첫·끝 남기고 가운데 전부 마스킹 (예: 한도선 → 한*선, 남궁민수 → 남**수)
 *
 * @param name 원본 이름
 * @returns 마스킹된 이름
 */
export function maskName(name: string): string {
  const chars = Array.from(name.trim());
  if (chars.length <= 1) return chars.join('');
  if (chars.length === 2) return `${chars[0]}*`;
  return `${chars[0]}${'*'.repeat(chars.length - 2)}${chars[chars.length - 1]}`;
}

/**
 * 상대 시간 — "방금 전 / N분 전 / N시간 전 / N일 전", 7일 이상은 날짜(YYYY.MM.DD).
 * 알림·댓글 등 최근 활동 표시에 사용한다.
 *
 * @param iso ISO 8601 날짜 문자열
 * @returns 사람이 읽는 상대 시간 라벨 (잘못된 입력이면 빈 문자열)
 */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return '방금 전';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  const d = new Date(then);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}
