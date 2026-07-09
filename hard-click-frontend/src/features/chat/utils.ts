/** ISO 8601 → "오전/오후 h:mm" (Figma 시간 표기) */
export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${period} ${hours}:${String(minutes).padStart(2, '0')}`;
}

/** 이름 첫 글자(아바타 이니셜) */
export function getInitial(name: string): string {
  return name.trim().charAt(0) || '?';
}
