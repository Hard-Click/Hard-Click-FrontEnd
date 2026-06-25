const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Refresh Token으로 새 Access Token 발급 (POST /api/auth/refresh).
 * 쿠키 set은 호출자 책임 — 응답 형태(버퍼/스트리밍)에 따라 set 방식이 다르기 때문.
 *
 * (catch-all 프록시 `app/api/[...path]/route.ts`와 `lib/api.ts`의 serverApi도 각자
 *  동일 재발급 로직을 갖고 있다. 추후 이 헬퍼로 통합 가능 — 지금은 SSE 스트리밍 라우트가 사용.)
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as {
      data?: { accessToken?: string };
    } | null;
    return json?.data?.accessToken ?? null;
  } catch {
    return null;
  }
}
