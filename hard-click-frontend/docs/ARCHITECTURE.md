# ARCHITECTURE.md — FLOWN 프론트엔드 아키텍처(왜 이렇게 짰는가)

> 이 문서는 **"코드를 보면 뻔한 것"이 아니라, 코드만 봐서는 알 수 없는 설계 의도**를 담는다.
> "무엇을 하는가"(How)는 소스가 이미 말해준다. 여기 적는 건 **왜 그 구조를 택했는가**(Why) — 트레이드오프, 외부 제약, 앞으로의 확장 기준이다.
> 파일 위치·디렉터리 지도는 `CLAUDE.md` §2, 코드 컨벤션은 `docs/CONVENTIONS.md`, 도메인별 연동 현황은 `src/mocks/config.ts` 주석을 정본으로 본다.

---

## 1. Server-First 렌더링 — 왜 기본이 서버인가

**원칙(3줄):**
1. 화면은 **Server Component가 기본**이다. `'use client'`는 상호작용이 실제로 필요한 **잎사귀(버튼·입력·모달)** 에만 붙인다.
2. **데이터 조회는 서버에서 `async/await`로** 한다. 클라이언트에서 `useEffect`+`useState`로 가져오지 않는다.
3. 서버가 받은 데이터는 **props로 잎사귀에 내려준다**. 데이터 때문에 컴포넌트가 client가 되지 않게 한다.

**왜 이렇게 하는가 (코드에 안 적히는 이유):**
- **CSR 페칭의 손해를 피한다** — `useEffect` 페칭은 (a)초기 빈 화면 깜빡임, (b)SEO 손실(크롤러가 빈 HTML을 봄), (c)토큰/키가 브라우저에 노출될 위험을 낳는다. 서버 렌더는 셋 다 해소한다.
- **경계를 가장 작은 잎사귀에 둔다** — 페이지·큰 트리를 통째로 client로 감싸면 그 아래 전부가 client 번들에 끌려간다. 그래서 `onClick`·`useState`가 **실제로 필요한 최소 조각만** 떼어낸다.
  - 예: `app/instructor/quizzes/page.tsx`는 Server Component로 `getInstructorCoursesServer`를 서버 조회하고, 강의 카드는 Server(`Link`), "등록" 버튼+모달만 client 섬 → **페이지·목록의 `use client`가 0**이다.
- **합성(children)으로 server를 client에 넣는다** — client 래퍼가 server 콘텐츠를 감싸야 하면 **`import`하지 말고 `children`으로 넘긴다.** import하면 그 server까지 client 번들로 딸려온다. `import`는 번들 경계를 넘기고, `children`은 넘기지 않는다 — 이게 핵심 차이다.
- **직렬화 제약** — server→client props는 JSON 가능한 값만(함수·클래스·`Date` 인스턴스 ❌). 이건 React의 물리적 제약이라 우회하지 않는다.

> ⚠️ **현재 상태:** 이미 작성된 일부 영역(`store/auth.store.ts` 등 초기 CSR 코드)은 이 원칙과 반대(클라이언트 중심)다. 신규 코드는 Server-First로 작성하고, 구코드는 점진 이전한다.

---

## 2. ⚠️ AI 사각지대: 격리막(USE_MOCK) 패턴 — mock↔live를 컴포넌트 무변경으로 스왑

> **이 절이 이 문서에서 가장 중요하다.** 코드를 부분만 읽은 AI는 "왜 매퍼가 이렇게 장황한지", "왜 컴포넌트를 안 고치고 연동하는지"를 놓친다.

### 무엇을 푸는 문제인가
백엔드가 도메인마다 **완성 시점이 다르다.** 어떤 도메인은 라이브고, 어떤 건 아직 500/미배포/미구현이다. 프론트가 이 진행 차이에 흔들리지 않으려면, **UI는 항상 같은 타입을 보고 렌더**하고 **데이터 출처(mock/live)만 뒤에서 갈아끼울 수 있어야** 한다. 그 갈아끼우는 지점이 **격리막(seam)** 이다.

### 어떻게 작동하는가
`src/mocks/config.ts`의 `isMock(domain)`이 도메인 단위 스위치다.

```ts
export const USE_MOCK = true;                 // 전역 기본값
const MOCK_OVERRIDE: Record<string, boolean> = {
  courses: false,   // 라이브 검증 끝난 도메인만 false로 등록
  cart: false,
  rankings: false,
  // ...여기 없는 도메인은 전역 USE_MOCK(true)을 따라 여전히 mock
};

export function isMock(domain: string): boolean {
  if (E2E_MOCK || FORCE_ALL_MOCK) return true;                     // E2E·프리뷰는 강제 mock
  return Object.hasOwn(MOCK_OVERRIDE, domain) ? MOCK_OVERRIDE[domain] : USE_MOCK;
}
```

**세 개의 상위 스위치가 있고, 각각 존재 이유가 다르다:**

| 스위치 | 값 | 왜 존재하나 |
|---|---|---|
| `USE_MOCK` | 전역 기본 | 오버라이드 안 된 도메인의 기본 동작 |
| `MOCK_OVERRIDE[domain]` | 도메인별 | **라이브 검증이 끝난 도메인만** `false`로 승격. 도메인마다 BE 완성도가 다르므로 도메인 단위로 관리 |
| `FORCE_ALL_MOCK` | 프리뷰용 | BE 없이 전체 화면을 확인할 때 **일시** `true`. 되돌리면 위 설정이 그대로 복원됨 |
| `E2E_MOCK` | `NEXT_PUBLIC_E2E_MOCK=1` | E2E 테스트를 **결정적**으로 돌리기 위해 BE 의존 제거. 평소엔 미설정이라 영향 0 |

### 매퍼가 왜 격리막인가 — `rankings/server.ts` 예시
격리막의 실체는 **BE 응답 shape → UI 계약 타입으로 바꾸는 매퍼**다. 이 매퍼가 있어서, BE가 필드명을 바꾸거나 실명을 raw로 줘도 **컴포넌트는 아무것도 모른다.**

```ts
export async function getRankingBoardServer(period, myMemberId): Promise<RankingBoard> {
  if (isMock('rankings')) {
    return toRankingBoard(mockRankingBoard);   // ← mock 분기: 같은 타입 반환
  }
  const [st, ls, ac] = await Promise.all([ /* 실 API 3개 병렬 */ ]);
  // ...실패는 throw(빈 데이터로 숨기지 않음 → error.tsx)
  return { studyTime: ..., lessonCount: ..., acceptedCount: ... };  // ← live 분기: 동일 타입
}
```

두 분기가 **동일한 `RankingBoard` 타입**을 반환하는 게 핵심이다. 그래서:
- **mock↔live 전환 = `config.ts`의 boolean 하나만** 바꾸면 된다.
- **연동 작업은 `server.ts`/`services.ts`/`actions.ts`만 건드리고, 컴포넌트는 무변경**이 기본이다. (이게 `CLAUDE.md` §0.1의 "요청 밖 UI 수정 금지" 3번을 구조적으로 강제한다 — 연동하다 UI를 건드릴 물리적 이유가 없어짐)
- 매퍼는 **정직성의 지점**이기도 하다. `rankings/server.ts`의 `toLiveUser`가 BE 실명을 `maskName`으로 가리고, `rank=null`을 "0위"로 위장하지 않는 것도 전부 이 매퍼 한 곳에서 처리된다. (`toRankItem`의 `slot?.rank ?? 0` 주석 참고 — 미랭크는 파생값임을 명시)

> ⚠️ **주석과 실제가 반대로 남지 않게** — mock 분기는 코드 주석에 반드시 "mock" 또는 "TODO 실 endpoint"를 남긴다. 이게 `CLAUDE.md` §0.1의 4번(안 되는데 말 안 하기 금지)을 코드로 지키는 방법이다.

---

## 3. ⚠️ AI 사각지대: BFF byte-transparent passthrough — 왜 브라우저가 동일 출처만 부르나

> AI가 놓치기 쉬운 지점: "왜 클라이언트 axios의 `baseURL`이 빈 문자열(`''`)이지?", "왜 백엔드를 직접 안 부르지?"

### 두 갈래의 통신 경로가 있다
FLOWN은 **누가 백엔드를 부르느냐**에 따라 경로가 둘로 갈린다. 둘 다 백엔드에 닿지만, 목적이 다르다.

| 호출 주체 | 경유 | 구현 |
|---|---|---|
| **브라우저(client 컴포넌트)** | 동일 출처 `/api/*` → **BFF 프록시** → Spring Boot | `services/api.ts`(client axios, `baseURL: ''`) → `app/api/[...path]/route.ts` |
| **서버(Server Component / Action)** | Spring Boot **직접** | `lib/api.ts`의 `serverApi`(server axios, `cookies()`로 토큰 첨부) |

즉 **서버 코드는 BFF 프록시를 거치지 않는다.** 프록시는 오직 브라우저가 백엔드에 닿아야 할 때만 쓰인다.

### 왜 브라우저는 동일 출처 `/api/*`만 부르는가
`app/api/[...path]/route.ts`는 **byte-transparent passthrough**다. 요청 바디를 `arrayBuffer()`로 그대로 받아 그대로 백엔드에 넘기고, 응답도 `arrayBuffer()`로 그대로 돌려준다. 이렇게 얇게 만든 이유:

1. **CORS 회피** — 브라우저가 `flown.vercel.app`에서 `api.backend.com`을 직접 부르면 교차 출처(CORS preflight·설정 지옥)가 된다. **동일 출처 `/api/*`** 로만 부르면 CORS가 애초에 발생하지 않는다. (그래서 `next.config` rewrites 프록시 의존도 제거 대상)
2. **토큰 은폐** — 토큰은 **httpOnly 쿠키**라 JS가 읽을 수 없다. 브라우저는 동일 출처 `/api/*`에 쿠키를 **자동 전송**만 하고, 프록시가 그 쿠키의 `accessToken`을 꺼내 `Authorization: Bearer`로 주입한다. → **클라이언트는 토큰을 아예 몰라도 되고, `localStorage`가 필요 없다.** (XSS로 토큰 탈취 불가)
3. **401 → refresh 재발급을 프록시가 대행** — accessToken 만료(401)면 프록시가 refreshToken으로 재발급 후 **원요청을 1회 재시도**하고, 새 accessToken을 쿠키에 다시 심는다. 클라이언트는 이 과정을 전혀 모른다.
4. **byte 보존이 왜 중요한가** — 바디를 파싱하지 않고 `arrayBuffer`로 넘기므로 **multipart boundary가 보존**된다(파일 업로드가 깨지지 않음). content-type도 요청·응답 양방향으로 그대로 전달한다.

> **single-flight refresh:** 동시 401이 여러 건 와도 재발급은 1회만(`refreshInFlight` 모듈 변수). ⚠️ 이건 **단일 서버 인스턴스 내에서만** 동작한다 — 서버리스 멀티 인스턴스에선 인스턴스별 1회다. Refresh는 idempotent라 중복 재발급이 무해해서 지금은 이 정도로 둔다. 엄격한 전역 dedup이 필요해지면 Redis 등 외부 상태로 전환한다.
>
> ⚠️ **확인 필요:** refreshToken 전달 방식(body vs 헤더)·응답 필드는 Swagger 확정 시 재검증 대상(현재 `{ refreshToken }` body + `data.accessToken` 가정).

---

## 4. 표준 도메인 파일 패턴 — 새 도메인은 이 4개를 복사한다

한 도메인은 `features/<도메인>/` 아래 **역할이 고정된 파일 세트**로 구성한다. 파일이 곧 계층이다.

| 파일 | 역할 | Server/Client |
|---|---|---|
| `types.ts` | 이 도메인의 타입(UI 계약 + BE 응답 shape). `interface`/`type` 구분 | 무관 |
| `server.ts` | **Server Component 전용** 조회. `isMock` 분기 + BE→UI 매퍼(격리막). `serverApi` 사용 | Server |
| `services.ts` | 백엔드 호출 함수(client 경로에서 쓰는 `api` 래퍼 포함). | 상황별 |
| `actions.ts` | `'use server'` **Server Action** — 검증 → 변환 → 전송 → `revalidatePath` | Server |
| `components/` | 이 도메인 전용 컴포넌트. 잎사귀만 `'use client'` | 혼합 |
| `schemas.ts`·`hooks.ts` | (선택) 폼 검증 스키마 / 전용 client 훅 | — |

**새 도메인을 만들 때의 복사 기준:**
- **조회만 있는 도메인** → `types.ts` + `server.ts`(+ mock)면 충분. (예: `subscriptions`는 서버 조회 합성만)
- **변경(CUD)이 있는 도메인** → `actions.ts`를 추가하고 `'use server'` + `revalidatePath`를 반드시 넣는다. (입력 검증 → 변환 → 전송 → `revalidatePath` 파이프라인)
- **격리막은 예외 없이** — 조회든 변경이든 `isMock('<도메인>')` 분기를 먼저 두고, mock/live가 **동일 타입**을 반환하게 한다. 이게 §2를 도메인마다 반복 적용하는 방법이다.
- BE 미구현 도메인은 **가정 shape + `// TODO GET /api/...`** 를 매퍼에 남기고 `MOCK_OVERRIDE`에 등록하지 않는다(= 전역 mock 유지).

> ⚠️ **`serverApi`는 클라이언트에서 import 금지** — `lib/api.ts`는 `cookies()`(`next/headers`)를 쓰므로 서버 전용이다. 클라 컴포넌트에서 import하면 빌드가 깨진다. 브라우저 경로는 `services/api.ts`의 `api`(동일 출처 `/api/*`)를 쓴다.

---

## 5. Provider 패턴 — 루트 layout 서버 fetch → Provider로 내려준다

전역 상태(인증·알림·회원 정지)는 **루트 `layout.tsx`(Server)가 서버에서 값을 계산/조회한 뒤, client Provider의 `value`로 내려주는** 한 가지 패턴을 공유한다. **client가 스스로 `useEffect`로 초기 데이터를 가져오지 않는다** — 이게 §1(Server-First)을 전역 상태에도 적용한 형태다.

```tsx
// app/layout.tsx (Server Component)
const user = await getCurrentUser();                         // 쿠키로 인증 계산 (localStorage 대체)
const notifications = user ? await getNotificationsServer()  // 로그인 사용자만 서버 조회
                          : { notifications: [], unreadCount: 0 };
return (
  <AuthProvider value={{ isLoggedIn: !!user, role, memberId }}>
    <NotificationProvider value={notifications}>            {/* 서버 조회값을 seed로 */}
      <MemberStatusProvider>{children}</MemberStatusProvider>
    </AuthProvider>
  </NotificationProvider>
);
```

| Provider | 초기값 출처 | 이후 갱신 | 왜 이 패턴 |
|---|---|---|---|
| **AuthProvider** | 서버 `getCurrentUser()`(쿠키) | 없음(정적 스냅샷) | 클라의 `localStorage` 인증 대체 — 서버가 쿠키로 계산해 내려줌 |
| **NotificationProvider** | 서버 `getNotificationsServer()` | SSE 이벤트 → 재조회 + 낙관적 읽음 | 헤더 종이 client여도 **초기 데이터는 서버 props**에서. SSE는 '초기 페칭'이 아니라 '실시간 구독'이라 §1 예외 |
| **MemberStatusProvider** | 없음(SSE `MEMBER_STATUS_SYNC`가 초기화) | SSE `MEMBER_STATUS_CHANGED` | 정지 상태는 실시간성이 본질이라 SSE가 seed까지 담당 |

**패턴에서 코드로 안 드러나는 의도:**
- **props로 파생된 state를 prop 변경 시 갱신** — `NotificationProvider`/`MemberStatusProvider`는 `useState`로 seed를 잡되, prop이 바뀌면(로그인/계정전환/`router.refresh`) **렌더 중에 동기화**한다(effect 아님, React 권장 패턴). 이게 없으면 **이전 사용자의 알림/상태가 잔존**한다.
- **SSE가 §1(useEffect 데이터 페칭 금지 원칙)을 어기지 않는 이유** — EventSource는 브라우저 전용 **스트림 구독**이지 초기 데이터 페칭이 아니다. 초기 데이터는 서버 props에서 오고, SSE는 "이벤트 수신 = 재조회"로만 쓴다. 그래서 **payload shape에 의존하지 않는다**(BE push 형식이 바뀌어도 안 깨짐).
- **낙관적 갱신은 실패 시 롤백** — 알림 읽음은 즉시 배지를 줄이고, Server Action이 실패하면 되돌린다(§0.1 — 가짜 성공으로 숨기지 않음).

> ⚠️ **확인 필요:** `NotificationProvider`의 SSE named 이벤트명(`notification`·`noti`)은 BE M3 전 가정값 — 확정되면 그 줄만 조정. `MemberStatusProvider`의 `MEMBER_STATUS_SYNC`/`CHANGED`는 커뮤니티 SSE 계약 기준.
> 🙋 **요청:** `layout.tsx`의 `metadataBase`는 실제 production 도메인이어야 og:image 절대경로가 맞는다. 배포 도메인 확정 시 값 확인 필요(현재 `hard-click-front-end.vercel.app`).

---

## 참고 파일(정본)

- 렌더링 원칙: 이 문서 §1 · Server Action/BFF: 이 문서 §3·§4 · 인증(httpOnly 쿠키): `src/features/auth/CLAUDE.md`
- 격리막 스위치: `src/mocks/config.ts`
- BFF 프록시: `src/app/api/[...path]/route.ts`
- 서버 axios(직접 호출): `src/lib/api.ts` / 클라 axios(동일 출처): `src/services/api.ts`
- 격리막 매퍼 예시: `src/features/rankings/server.ts`
- Provider 조립: `src/app/layout.tsx` + `src/features/{auth,notifications,community}/*Provider.tsx`

