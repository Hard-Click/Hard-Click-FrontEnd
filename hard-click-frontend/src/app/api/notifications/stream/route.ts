import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { refreshAccessToken } from '@/lib/auth-refresh';
import { ACCESS_TOKEN_MAX_AGE, AUTH_COOKIE_BASE } from '@/lib/auth-cookies';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// SSE는 매 연결마다 라이브 스트림 → 캐시/정적화 금지. 스트리밍 위해 node 런타임.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** SSE 형식 에러 프레임 (EventSource가 본문을 파싱하다 죽지 않게 같은 content-type으로 응답) */
function sseError(status: number, reason: string): Response {
  return new Response(`event:error\ndata:${reason}\n\n`, {
    status,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' },
  });
}

function subscribe(token: string, signal: AbortSignal): Promise<Response> {
  return fetch(`${BACKEND}/api/notifications/subscribe`, {
    headers: { authorization: `Bearer ${token}`, accept: 'text/event-stream' },
    cache: 'no-store',
    // 클라(EventSource)가 끊기면 이 요청도 abort → BE 연결도 닫힘(연결 누수 방지)
    signal,
  });
}

/**
 * 알림 실시간(SSE) BFF 프록시 — 브라우저 EventSource(`/api/notifications/stream`)를
 * 백엔드 SSE(`GET /api/notifications/subscribe`, text/event-stream)로 중계한다.
 *
 * 왜 별도 라우트인가:
 *  - `app/api/[...path]/route.ts`(범용 프록시)는 응답을 `arrayBuffer()`로 **버퍼링**해서
 *    스트림이 끝나길 기다린다 → SSE(무한 스트림)는 영원히 안 끝나 hang. 그래서 스트리밍 전용.
 *  - 더 구체적인 경로라 catch-all보다 우선 매칭된다.
 *
 * 인증 브릿지: EventSource는 커스텀 헤더를 못 싣고, 우리 토큰은 httpOnly 쿠키(Next 도메인)다.
 *  → 브라우저는 동일 출처(`/api/...`)라 쿠키를 자동 전송 → 이 핸들러가 꺼내 `Bearer`로 BE에 주입.
 *  → accessToken 만료(401)면 refreshToken으로 1회 재발급·재시도(catch-all 프록시와 동일 정책).
 *    스트림 시작 전에 응답 헤더로 새 accessToken 쿠키를 갱신한다(스트림 중엔 Set-Cookie 불가).
 *
 * BE SSE 엔드포인트는 이미 라이브(2026-06-25 검증: `event:connect / data:connected`).
 * 실제 알림 push 이벤트(이름·payload)는 BE M3(6/26) 후 확정 — 클라(NotificationProvider)는
 * push payload를 파싱하지 않고 "이벤트 수신=재조회" 방식이라 그 shape에 의존하지 않는다.
 */
export async function GET(req: NextRequest): Promise<Response> {
  // 교차 사이트 요청 거부 (defense-in-depth). same-site는 형제 서브도메인까지 통과하므로 제외 →
  // 동일 출처 EventSource만 허용. (Sec-Fetch-Site 미지원 브라우저는 헤더가 없어 통과)
  const site = req.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') {
    return sseError(403, 'cross-site');
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  let token = cookieStore.get('accessToken')?.value;
  let refreshedToken: string | null = null;

  // accessToken이 비어 있어도(만료) refreshToken이 있으면 먼저 재발급 시도 → SSE 스스로 복구
  if (!token) {
    if (!refreshToken) return sseError(401, 'no-token');
    refreshedToken = await refreshAccessToken(refreshToken);
    if (!refreshedToken) return sseError(401, 'refresh-failed');
    token = refreshedToken;
  }

  let upstream: Response;
  try {
    upstream = await subscribe(token, req.signal);

    // accessToken은 있었지만 만료(401) → refreshToken으로 재발급 후 1회 재시도
    if (upstream.status === 401 && refreshToken && !refreshedToken) {
      refreshedToken = await refreshAccessToken(refreshToken);
      if (refreshedToken) upstream = await subscribe(refreshedToken, req.signal);
    }
  } catch {
    return sseError(502, 'upstream-unreachable');
  }

  if (!upstream.ok || !upstream.body) {
    // 401이면 그대로 401(EventSource는 non-200이면 재연결 안 함 → 토큰 만료 시 폭주 방지)
    return sseError(upstream.status === 401 ? 401 : 502, `upstream-${upstream.status}`);
  }

  // 업스트림 SSE 스트림을 그대로 클라로 흘려보낸다. (헤더는 본문 스트림 전에 전송됨)
  const res = new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no', // 중간 프록시(nginx 등) 버퍼링 비활성 → 즉시 전달
    },
  });
  // 재발급됐으면 새 accessToken 쿠키 갱신 (브라우저 쿠키가 만료된 채 남지 않게)
  if (refreshedToken) {
    res.cookies.set('accessToken', refreshedToken, {
      ...AUTH_COOKIE_BASE,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  }
  return res;
}
