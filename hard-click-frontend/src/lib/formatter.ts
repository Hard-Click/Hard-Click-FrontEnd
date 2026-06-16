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
