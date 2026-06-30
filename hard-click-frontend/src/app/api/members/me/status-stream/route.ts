import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { refreshAccessToken } from '@/lib/auth-refresh';
import { ACCESS_TOKEN_MAX_AGE, AUTH_COOKIE_BASE } from '@/lib/auth-cookies';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sseError(status: number, reason: string): Response {
  return new Response(`event:error\ndata:${reason}\n\n`, {
    status,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' },
  });
}

function subscribe(token: string, signal: AbortSignal): Promise<Response> {
  return fetch(`${BACKEND}/api/members/me/status-stream`, {
    headers: { authorization: `Bearer ${token}`, accept: 'text/event-stream' },
    cache: 'no-store',
    signal,
  });
}

/**
 * 회원 상태 SSE BFF 프록시 — 브라우저 EventSource(`/api/members/me/status-stream`)를
 * 백엔드 SSE(`GET /api/members/me/status-stream`, text/event-stream)로 중계한다.
 *
 * 이벤트 종류:
 *  - MEMBER_STATUS_SYNC: 연결 직후 현재 상태 1회 전송 (SUSPENDED 여부 초기화)
 *  - MEMBER_STATUS_CHANGED: 실시간 상태 변경 (ACTIVE ↔ SUSPENDED)
 *  - heartbeat: 30초마다 연결 유지용 → 클라에서 무시
 */
export async function GET(req: NextRequest): Promise<Response> {
  const site = req.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') {
    return sseError(403, 'cross-site');
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  let token = cookieStore.get('accessToken')?.value;
  let refreshedToken: string | null = null;

  if (!token) {
    if (!refreshToken) return sseError(401, 'no-token');
    refreshedToken = await refreshAccessToken(refreshToken);
    if (!refreshedToken) return sseError(401, 'refresh-failed');
    token = refreshedToken;
  }

  let upstream: Response;
  try {
    upstream = await subscribe(token, req.signal);

    if (upstream.status === 401 && refreshToken && !refreshedToken) {
      refreshedToken = await refreshAccessToken(refreshToken);
      if (refreshedToken) upstream = await subscribe(refreshedToken, req.signal);
    }
  } catch {
    return sseError(502, 'upstream-unreachable');
  }

  if (!upstream.ok || !upstream.body) {
    return sseError(upstream.status === 401 ? 401 : 502, `upstream-${upstream.status}`);
  }

  const res = new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
  if (refreshedToken) {
    res.cookies.set('accessToken', refreshedToken, {
      ...AUTH_COOKIE_BASE,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  }
  return res;
}
