/** ISO 8601 → "오전/오후 h:mm" (Figma 시간 표기).
 *  ⚠️ sentAt 소스가 2종: REST 히스토리=`...+09:00`(offset 있음), STOMP CHAT=offset 없는 LocalDateTime(KST 의미).
 *     offset 없는 문자열은 `new Date`가 **브라우저 로컬**로 파싱해 비-KST 기기서 시간이 틀리고 히스토리와 불일치 →
 *     offset 없으면 +09:00로 보정하고, 표시는 **기기 타임존과 무관하게 항상 KST**(고정 +9h, 한국은 DST 없음)로 통일. */
export function formatMessageTime(iso: string): string {
  const hasTz = /(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
  const d = new Date(hasTz ? iso : `${iso}+09:00`);
  if (Number.isNaN(d.getTime())) return '';
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000); // 절대시각 → KST 벽시계(UTC getter로 읽음)
  let hours = kst.getUTCHours();
  const minutes = kst.getUTCMinutes();
  const period = hours < 12 ? '오전' : '오후';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${period} ${hours}:${String(minutes).padStart(2, '0')}`;
}

/** 이름 첫 글자(아바타 이니셜) */
export function getInitial(name: string): string {
  return name.trim().charAt(0) || '?';
}
