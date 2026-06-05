import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * BFF 프록시 — 클라이언트의 `/api/*` 요청을 백엔드로 중계한다.
 *
 * 브라우저는 동일 출처 `/api/*` 요청에 httpOnly 쿠키를 자동 전송하고,
 * 이 핸들러가 쿠키의 accessToken을 읽어 `Authorization: Bearer` 헤더로 주입한다.
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
  const token = cookieStore.get('accessToken')?.value;
  const memberId = cookieStore.get('memberId')?.value;

  const targetUrl = `${BACKEND}/api/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType); // multipart boundary 보존
  if (token) headers.set('authorization', `Bearer ${token}`);
  if (memberId) headers.set('x-member-id', memberId);

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: 'no-store',
    });
  } catch {
    return Response.json(
      { httpStatus: 500, message: '서버와 연결할 수 없습니다', data: null },
      { status: 502 },
    );
  }

  const resBody = await backendRes.arrayBuffer();
  const resHeaders = new Headers();
  const resContentType = backendRes.headers.get('content-type');
  if (resContentType) resHeaders.set('content-type', resContentType);

  return new Response(resBody, {
    status: backendRes.status,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
