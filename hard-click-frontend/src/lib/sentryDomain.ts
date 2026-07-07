/**
 * URL 경로에서 담당 도메인을 추론한다 (Sentry Slack 알림에서 담당자 판단용).
 * 예: "/quizzes" -> "quizzes", "/admin/reports" -> "admin:reports",
 *     "https://.../instructor/courses" -> "instructor:courses"
 * 백엔드 GlobalExceptionHandler의 domain 태그와 대칭.
 */
export function extractDomain(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return "unknown";
  let path = pathOrUrl;
  try {
    path = new URL(pathOrUrl).pathname;
  } catch {
    // 이미 경로 형태
  }
  const seg = path.replace(/^\/+/, "").split("/").filter(Boolean);
  if (seg.length === 0) return "root";
  // admin·instructor 라우트 그룹은 한 단계 더 들어가 실제 화면 도메인까지
  if ((seg[0] === "admin" || seg[0] === "instructor") && seg[1]) {
    return `${seg[0]}:${seg[1]}`;
  }
  return seg[0];
}
