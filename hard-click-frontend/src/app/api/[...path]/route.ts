import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_MAX_AGE,
  AUTH_COOKIE_BASE as COOKIE_BASE,
  AUTH_COOKIE_NAMES,
} from '@/lib/auth-cookies';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Refresh Token으로 Access Token 재발급 (POST /api/auth/refresh).
 * - 정책: refresh 응답은 `accessToken`만 반환, Refresh Token은 그대로 유지.
 * - 동시 401이 여러 건 와도 재발급은 1회만 (single-flight)으로 중복 호출 방지.
 *   단, 모듈 레벨 변수라 **단일 서버 인스턴스 내에서만** 동작한다(서버리스 멀티 인스턴스에선
 *   인스턴스별로 1회씩). Refresh는 고정 방식이라 중복 재발급은 무해(idempotent)하며,
 *   엄밀한 전역 dedup이 필요해지면 Redis 등 외부 상태로 전환한다.
 *
 * ⚠️ refreshToken 전달 방식(body vs 헤더)·응답 필드는 Swagger 확정 시 재확인 필요.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function fetchNewAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND}/api/auth/refresh`, {
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

function getRefreshedAccessToken(refreshToken: string): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = fetchNewAccessToken(refreshToken).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * BFF 프록시 — 클라이언트의 `/api/*` 요청을 백엔드로 중계한다.
 *
 * 브라우저는 동일 출처 `/api/*` 요청에 httpOnly 쿠키를 자동 전송하고,
 * 이 핸들러가 쿠키의 accessToken을 읽어 `Authorization: Bearer` 헤더로 주입한다.
 * Access Token 만료(401)면 Refresh Token으로 재발급 후 원요청을 1회 재시도한다.
 * → 클라이언트는 토큰을 몰라도 되고, **localStorage가 필요 없다.**
 *
 * (서버 컴포넌트/Server Action은 lib/api.ts의 serverApi로 백엔드를 직접 호출하므로
 *  이 프록시를 거치지 않는다.)
 */
async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const cookieStore = await cookies();
  const pathStr = path.join('/');
  const memberId = cookieStore.get('memberId')?.value;

  const targetUrl = `${BACKEND}/api/${pathStr}${req.nextUrl.search}`;

  const reqContentType = req.headers.get('content-type');
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const send = (token?: string) => {
    const headers = new Headers();
    if (reqContentType) headers.set('content-type', reqContentType); // multipart boundary 보존
    if (token) headers.set('authorization', `Bearer ${token}`);
    if (memberId) headers.set('x-member-id', memberId);
    return fetch(targetUrl, {
      method: req.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: 'no-store',
    });
  };

  // refresh/login 자체는 재발급 대상에서 제외 (무한 루프 방지)
  const isAuthEndpoint =
    pathStr.startsWith('auth/refresh') || pathStr.startsWith('auth/login');

  let refreshedToken: string | null = null;
  let backendRes: Response;
  try {
    backendRes = await send(cookieStore.get('accessToken')?.value);

    if (backendRes.status === 401 && !isAuthEndpoint) {
      const refreshToken = cookieStore.get('refreshToken')?.value;
      if (refreshToken) {
        refreshedToken = await getRefreshedAccessToken(refreshToken);
        if (refreshedToken) backendRes = await send(refreshedToken);
      }
    }
  } catch {
    // 백엔드에 닿지 못함 → 게이트웨이 에러로 일관 (body·HTTP 모두 502)
    return NextResponse.json(
      { httpStatus: 502, message: '서버와 연결할 수 없습니다', data: null },
      { status: 502 },
    );
  }

  const resBody = await backendRes.arrayBuffer();
  const response = new NextResponse(resBody, { status: backendRes.status });
  const resContentType = backendRes.headers.get('content-type');
  if (resContentType) response.headers.set('content-type', resContentType);

  // 재발급 성공 시 Access Token만 교체 (Refresh Token은 유지)
  if (refreshedToken) {
    response.cookies.set('accessToken', refreshedToken, {
      ...COOKIE_BASE,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  } else if (backendRes.status === 401 && !isAuthEndpoint) {
    // 재발급 실패/불가(만료·BANNED·WITHDRAWN·locked) → 세션 토큰 정리
    // (클라이언트는 401 응답을 받고 로그인 페이지로 이동)
    for (const name of AUTH_COOKIE_NAMES) {
      response.cookies.set(name, '', { ...COOKIE_BASE, maxAge: 0 });
    }
  }

  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
