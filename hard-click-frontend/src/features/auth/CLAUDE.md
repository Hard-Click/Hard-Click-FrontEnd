# CLAUDE.md — `features/auth` (인증·세션)

> 이 폴더는 **인증(로그인/로그아웃/세션)** 을 담당한다. 파일 구조·타입·컴포넌트 분리 같은
> **코드로 이미 뻔한 건 여기 안 적는다.** 여기 적는 건 오직 **코드만 봐서는 틀리기 쉬운 보안·위험 지점**이다.
> (전역 인증 원칙은 루트 `CLAUDE.md §0`(원칙 3: httpOnly 쿠키). 이 문서는 그걸 **실제 구현 기준으로 좁힌 주의사항**.)

---

## ⚠️ AI 사각지대 (보안·위험) — 여기만 읽어도 됨

### (1) 토큰은 **httpOnly 쿠키**에만 산다 — `localStorage` 절대 금지
- `accessToken`·`refreshToken`·`memberId`·`role` 4개가 전부 **httpOnly 쿠키**다. (`lib/auth-cookies.ts`가 단일 소스)
- **httpOnly = JS가 못 읽는다.** `document.cookie`로도 안 보인다. 이건 **버그가 아니라 XSS 방어의 핵심**이다.
- ❌ 토큰을 `localStorage`/`sessionStorage`/전역 store에 저장하는 코드 추가 금지. (XSS로 탈취됨)
  - 클라에서 로그인 여부·역할이 필요하면 **`useAuth()`**(AuthProvider) 를 쓴다 → (5) 참고. 쿠키를 직접 읽으려 하지 마라.
- 쿠키 옵션은 `AUTH_COOKIE_BASE` 하나로 통일: `httpOnly`·`sameSite:'lax'`·`secure`는 **프로덕션에서만 true**(로컬 http 개발은 false). **여기저기서 옵션을 새로 쓰지 말고 반드시 이 상수를 spread** 한다 — drift 나면 쿠키가 안 붙거나 secure 불일치로 로그인이 깨진다.

### (2) 토큰 첨부는 **서버가** 한다 — 클라가 토큰 읽어 헤더 붙이는 패턴 금지
토큰이 httpOnly라 클라는 애초에 못 붙인다. **첨부 경로는 호출자에 따라 둘로 갈린다** (헷갈리기 쉬움):

| 호출 주체 | API 클라이언트 | 토큰을 붙이는 곳 |
|---|---|---|
| **서버 컴포넌트 / Server Action** | `serverApi` (`lib/api.ts`) | **서버 axios 요청 인터셉터**가 `cookies()`로 accessToken을 꺼내 `Authorization: Bearer` 주입 |
| **클라이언트 컴포넌트** | `api` (`services/api.ts`) → 동일출처 `/api/*` | **BFF 프록시**(`app/api/[...path]/route.ts`)가 자동 전송된 쿠키를 읽어 `Authorization` 주입 후 백엔드로 중계 |

- 즉 **클라 axios는 토큰을 전혀 모른다.** 브라우저가 same-origin `/api/*` 요청에 httpOnly 쿠키를 **자동 전송**하고, 프록시가 그걸 헤더로 바꾼다.
- ❌ 클라 컴포넌트에서 `serverApi`(`@/lib/api`)를 **import 금지.** `cookies()`(`next/headers`)를 쓰므로 서버에서만 import 가능 — 클라에서 부르면 빌드가 깨진다.
- ❌ 어떤 컴포넌트에서도 `Authorization` 헤더를 **손으로 만들지 마라.** 두 경로 모두 자동이다. 수동으로 붙이면 토큰이 클라 JS에 노출되는 순간 (1) 위반이다.
- `memberId`도 같은 방식으로 `X-Member-Id`(서버 axios) / `x-member-id`(프록시) 헤더로 자동 첨부된다.

### (3) 401 → refresh 재발급 후 **1회만** 재시도 (single-flight)
두 경로 **모두** accessToken 만료(401)를 이렇게 처리한다:
1. Refresh Token으로 `POST /api/auth/refresh` 호출 → **새 accessToken만** 받는다. (Refresh Token은 그대로 유지)
2. 새 토큰으로 **원요청을 딱 1회 재시도.** 재발급 실패면 재시도 안 함.
3. `auth/refresh`·`auth/login` 자체는 재발급 대상에서 **제외**(무한 루프 방지).

- **single-flight**(BFF 프록시): 동시에 401이 여러 건 와도 재발급은 **모듈 레벨 `refreshInFlight` 하나로 1회만** 실행된다.
  - ⚠️ 이 dedup은 **단일 서버 인스턴스 안에서만** 유효하다. 서버리스 멀티 인스턴스면 인스턴스별로 1회씩 재발급이 뜰 수 있다. Refresh가 idempotent라 지금은 무해하지만, **엄밀한 전역 dedup이 필요해지면 Redis 등 외부 상태로** 옮겨야 한다. (이 전제를 깨는 refresh 정책 변경 주의)
- **재발급 실패 시**(만료·BANNED·WITHDRAWN·locked 등):
  - 프록시: 인증 쿠키 4종을 **모두 만료(maxAge 0)** 시키고 401을 그대로 클라로 보낸다.
  - 클라(`services/api.ts`): 401을 받으면 `/auth/login`으로 **강제 이동**한다. 단 **`errorCode === 'AUTH_009'`(현재 비밀번호 불일치)는 예외** — 이건 세션 만료가 아니라 비번변경·회원탈퇴의 "본인 확인" 실패라, 로그인으로 튕기지 않고 에러를 호출자(모달)에 그대로 돌려준다. **이 예외를 지우면 비번 한 번 틀린 사용자가 로그아웃된다.**
- ⚠️확인: refresh 요청의 **refreshToken 전달 방식(현재 request body)·응답 필드(`data.accessToken`)** 는 아직 Swagger 확정 대기 상태다. 백엔드 계약이 바뀌면 `route.ts`·`lib/api.ts` 두 곳을 같이 고쳐야 한다.

### (4) `redirect()`는 반드시 **try/catch 밖**에서
- `loginAction`은 성공 시 역할별 페이지로 `redirect()` 한다. `redirect()`는 내부적으로 **`NEXT_REDIRECT` 에러를 던져** 동작한다.
- ❌ `try { ... redirect() } catch {}` 안에 두면 리다이렉트 에러가 **catch에 먹혀** 이동이 안 된다. 반드시 백엔드 호출 `try/catch` **바깥**에서 호출한다. (login.action.ts 구조가 그렇게 되어 있으니 순서를 바꾸지 마라.)

### (5) 클라 인증 상태 = **AuthProvider (루트 layout에서 서버가 계산)**
- 흐름: 루트 `app/layout.tsx`(서버)가 `getCurrentUser()`로 **쿠키에서** `isLoggedIn`/`role`/`memberId`를 계산 → `<AuthProvider value={...}>` 로 클라 트리에 내려준다.
- 클라 컴포넌트는 **`useAuth()`** 로 읽는다. (localStorage 직접 읽기 대체)
- `getCurrentUser()`는 JWT를 디코드하지 않는다 — `establishSession`이 `role`·`memberId`를 **별도 쿠키로** 저장해 두므로 쿠키만 읽으면 된다. accessToken 쿠키가 없으면 비로그인(`null`).
- ⚠️ 그래서 `role`/`memberId` 쿠키는 **화면 표시·라우팅 판단용 신뢰 소스가 아니다**(위·변조 가능한 식별 편의값). **권한이 걸린 실제 데이터는 항상 백엔드가 accessToken으로 재검증**한다 — 클라의 `role`만 믿고 민감 정보를 렌더하지 마라.

---

## 참고 (코드로 알 수 있어 짧게만)
- **세션 쓰기 진입점은 3곳뿐**: `login.action.ts`(로그인), `session.ts`(`establishSession`/`clearSession`), 프록시의 재발급/정리. 쿠키를 **다른 곳에서 직접 `set`/`delete` 하지 마라** — 정책이 흩어진다.
- **로그아웃**(`logout.actions.ts`): 백엔드 `POST /api/auth/logout`이 body에 `refreshToken`(@NotBlank)을 요구 → 서버에서 쿠키를 읽어 주입한다. 이후 `clearSession()`으로 쿠키 정리.
- **MOCK 모드**(`USE_MOCK_AUTH`): 인증 도메인은 실서버 연동이 기본이나, BE 없이 데모/E2E가 필요할 때만 `login.action.ts`의 mock 분기가 고정 계정(test/admin1/instructor1)으로 결정적 로그인을 한다. **PR 전 mock 플래그 원복 필수**(루트 §0.1 · `docs/WORKFLOW.md` §8).
- 🙋요청: 백엔드 토큰 수명 실제값 — 현재 상수는 **Access 15분 / Refresh 14일**(`auth-cookies.ts`) 기준. 백엔드 정책이 다르면 이 상수를 맞춰야 한다(쿠키 maxAge가 여기서 결정됨).

---

작성 완료. 파일: `src/features/auth/CLAUDE.md`

코드 검증으로 원본 §6 대비 정정·구체화한 핵심:
- **토큰 첨부 경로가 하나가 아니라 둘**임을 확인 — 서버 axios 인터셉터(`lib/api.ts` serverApi, RSC/Server Action용) **와** BFF 프록시(`app/api/[...path]/route.ts`, 클라 `api`용)로 호출자에 따라 갈린다. 표로 명시.
- **single-flight**는 프록시의 모듈 레벨 `refreshInFlight` 변수 — 단일 인스턴스 한정이라는 실제 코드 주석의 caveat까지 반영.
- refresh는 **accessToken만** 재발급(refreshToken 유지), `AUTH_009` 예외로 비번 오입력 시 로그아웃 방지 — 코드에 있는 미묘한 분기라 지우면 회귀 위험으로 강조.
- `⚠️확인`: refresh body/응답 계약이 실제 코드에서도 Swagger 대기로 flag돼 있어 그대로 반영.
- `🙋요청`: 토큰 수명(Access 15분/Refresh 14일) 실제값 확인 요청.
