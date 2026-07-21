# DEPLOYMENT.md — 배포 & 환경변수 (사람용)

> 이 문서는 **코드만 봐서는 알 수 없는 배포 사실**만 적는다.
> "빌드하면 정적 산출물이 나온다" 같은 코드로 뻔한 건 생략하고,
> **어디에 올라가는가 · 어떤 값이 언제 박히는가 · 어떤 플랫폼 제약이 있는가** 처럼
> **AI가 레포 코드만 읽어서는 틀리기 쉬운 것**에 집중한다.

---

## 0. ⚠️ AI 사각지대 요약 (먼저 읽기)

프론트 코드를 아무리 grep해도 **아래 4가지는 레포 밖 사실**이라 알 수 없다. AI가 추측하면 거의 틀린다.

| 사각지대 | 코드로 안 보이는 이유 | 실제 |
|---|---|---|
| **배포 대상** | `package.json`에 배포 스크립트 없음 | **Vercel** (백엔드 EC2와 **다른 인프라**). §1 |
| **env 실제값** | `.env.local`/프로덕션 값은 gitignore, 레포에 없음 | Vercel 대시보드에만 존재. §2 |
| **`NEXT_PUBLIC_*` 시점** | 코드엔 `process.env.X`만 보임 | **빌드 시 값이 박힘(baked)** → 값 바꾸면 **재배포 필수**. §2 |
| **업로드 용량 한계** | `next.config.ts`엔 `bodySizeLimit: '10mb'`로 적혀 있음 | Vercel 플랫폼이 **4.5MB에서 먼저 막음** → 큰 파일은 우회. §3 |

---

## 1. ⚠️ 배포 = Vercel (백엔드 EC2 아님)

**프론트는 Vercel에 배포된다.** 백엔드(Spring Boot)는 EC2(`13.125.94.217:8080`)에서 돌지만, **프론트는 별개 인프라**다. 둘을 같은 서버로 착각하면 안 된다.

- **리전:** `vercel.json` → `{ "regions": ["icn1"] }` = **서울(icn1)**. 백엔드 EC2(ap-northeast-2, 서울)와 물리적으로 가깝게 묶어 서버-서버 통신(BFF) 지연을 줄이려는 의도. ⚠️확인: 실제 프로젝트 리전이 이 파일과 일치하는지(대시보드 설정이 파일을 덮을 수 있음).
- **"프론트가 외부를 못 본다"의 정체 = Vercel 실행 환경.** 프론트의 서버 코드(Server Component·Server Action·BFF 라우트)는 Vercel의 서버리스/엣지에서 돈다. 로컬에서 되던 게 배포에서 안 되는 대부분의 원인은 **① env 미설정 ② 플랫폼 용량 제한 ③ 아웃바운드 네트워크**다 — 코드가 아니라 **플랫폼 설정** 문제일 때가 많다.

### 프리뷰 vs 프로덕션

Vercel은 **환경이 2종(+로컬)** 이고, **각 환경마다 env 값을 따로 관리**한다. 이게 "로컬은 되는데 배포는 안 됨"의 흔한 원인이다.

| 환경 | 언제 배포되나 | URL | env 세트 |
|---|---|---|---|
| **Production** | `develop`(또는 프로덕션 브랜치) 머지 시 | 고정 도메인 (🙋요청) | Production env |
| **Preview** | 그 외 브랜치 push / PR 마다 | 매 배포 랜덤 URL (`*-git-<branch>-*.vercel.app`) | Preview env |
| Development | 로컬 `npm run dev` | `localhost:3000` | `.env.local` |

- ⚠️확인: **어느 브랜치가 Production 배포 트리거인지.** 팀 규칙상 base는 `develop`(CLAUDE.md §12)이지만, Vercel이 어떤 브랜치를 Production으로 물고 있는지는 대시보드 설정 사항이라 코드로 확정 불가.
- **PR마다 프리뷰 URL이 자동 생성**된다 → 리뷰어가 실제 화면 확인 가능. 단 **프리뷰 env가 프로덕션과 다르면** 프리뷰에서만 재현되는 버그가 생긴다(특히 API 주소·토스 키).

---

## 2. ⚠️ 환경변수 — `NEXT_PUBLIC_*`는 빌드 시 박힌다(baked)

이게 프론트 env의 **가장 큰 함정**이다. 백엔드 런타임 env(`application.yml`)와 **동작이 다르다.**

### `NEXT_PUBLIC_` 접두사의 의미

- **`NEXT_PUBLIC_` 붙음 → 브라우저에 노출 + 빌드 시점에 번들 코드에 문자열로 박힘.**
  - 코드에서 `process.env.NEXT_PUBLIC_API_BASE_URL`은 런타임 조회가 아니라 **빌드 때 실제 값으로 치환**된다.
  - ⚠️ **값을 바꾸면 재배포(재빌드) 해야 반영된다.** Vercel 대시보드에서 값만 고치고 재배포 안 하면 **옛날 값이 그대로** 서빙된다. (백엔드처럼 "env 고치고 재시작"이 아니다 — 프론트는 "env 고치고 **재빌드**".)
- **접두사 없음 → 서버 전용, 브라우저에 노출 안 됨.** BFF 라우트·Server Action 등 서버 코드에서만 `process.env.X`로 읽힌다.

### ⛔ 시크릿에 `NEXT_PUBLIC_` 절대 금지

`NEXT_PUBLIC_`이 붙은 값은 **빌드 산출물(JS 번들)에 평문으로 들어가 누구나 본다.** 따라서:

- ✅ `NEXT_PUBLIC_`에 넣어도 되는 것: **원래 공개되는 값만** — 백엔드 베이스 URL, 토스 **클라이언트** 키(공개용).
- ⛔ 절대 안 되는 것: JWT 시크릿, 토스 **시크릿** 키, DB 비번 등. → **접두사 없이** 서버 env로만. (`.env.example`도 이 원칙대로 `TOSS_SECRET_KEY` 등을 접두사 없는 예시로 둠.)

### 실제 사용 변수 목록 (코드 검증됨)

| 변수 | 노출 | 코드 사용처 | 없을 때 폴백 |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | 공개 | `src/lib/api.ts` (axios 베이스), `src/app/api/[...path]/route.ts` (BFF 프록시 대상) | `http://localhost:8080` |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 공개 | `src/features/payments/toss.ts` → `TOSS_CLIENT_KEY` | `''` (빈 값) → **결제 흐름 비활성 / mock 폴백** |

- ⚠️ **폴백이 조용한 함정.** 둘 다 값이 없으면 에러가 아니라 **조용히 로컬/mock으로 동작**한다. 프로덕션에서 `NEXT_PUBLIC_API_BASE_URL`을 안 넣으면 브라우저가 `localhost:8080`을 때려 전 API가 실패하고, 토스 키가 비면 결제가 **말없이 mock으로 빠진다.** → 배포 후 반드시 실제 값이 박혔는지 확인.
- **`.env.example`은 커밋 O, `.env.local`/`.env.production`은 gitignore** (CLAUDE.md §12). 그래서 **실제 값은 레포에 없다.** 아래 §5 참고.

---

## 3. ⚠️ Vercel 4.5MB 요청 바디 제한 → 큰 파일은 우회

**Vercel 서버리스 함수는 요청 바디를 최대 약 4.5MB까지만 받는다.** 이건 **플랫폼 하드 리밋**이라 코드로 못 늘린다.

- ⚠️ **함정:** `next.config.ts`에는 이렇게 적혀 있다 —
  ```ts
  experimental: { serverActions: { bodySizeLimit: '10mb' } }
  ```
  이건 **Next.js(앱) 레벨** 한도일 뿐, **Vercel(플랫폼)이 그 앞에서 4.5MB로 먼저 자른다.** 즉 `10mb`로 적혀 있어도 배포 환경에선 **4.5MB 초과 요청이 `413`으로 막힌다.** 로컬(`npm run dev`)에선 플랫폼 제한이 없어 10MB까지 통과 → **"로컬은 되는데 배포는 413"** 의 전형적 원인.

### 우회: 영상 등 큰 파일은 presigned S3 직접 업로드

**파일이 서버(Vercel)를 거치지 않게** 한다. 브라우저가 S3로 **직접** 올린다.

```
[일반 업로드 — 4.5MB 초과 시 413]
브라우저 → (파일) → Vercel(BFF/Server Action) → 백엔드/S3     ❌ 큰 영상

[presigned 우회 — 파일이 Vercel을 안 거침]
브라우저 → 백엔드에 presigned URL 요청 (작은 요청, Vercel 통과 OK)
브라우저 → (파일) → S3 직접 PUT (Vercel 우회 → 4.5MB 제한 무관)
브라우저 → 백엔드에 "업로드 완료" 통지
```

- **영상만 presigned가 필수**(수 MB~수백 MB). 썸네일·프로필 이미지 등 작은 파일은 일반 업로드로 충분.
- 참고: 영상 **재생** 쪽도 presigned URL을 쓴다(수강권 검증). `next.config.ts`의 `images.remotePatterns`에 `*.s3.ap-northeast-2.amazonaws.com`가 등록된 이유(썸네일=public S3, 영상=presigned, 와일드카드가 둘 다 커버).
- ⚠️확인: presigned **업로드** 엔드포인트를 백엔드가 실제로 제공하는지. (재생용 presigned는 라이브 확인됨 / 업로드용은 BE 계약 확인 필요 — 🙋요청.)

---

## 4. 배포 트리거 & 빌드 주의

- **빌드 명령:** `npm run build` (`next build`). Vercel이 push를 감지해 자동 실행.
- ⚠️ **활성 라우트의 `page.tsx`가 비어(0바이트) 있으면 `next build`가 실패한다.** 빈 파일은 의도된 스캐폴딩(CLAUDE.md §2·§8)이지만 **배포되는 라우트는 반드시 채워야** 빌드가 통과한다. → PR 올리기 전 로컬에서 `npm run build` 확인(CLAUDE.md §12).
- ⛔ **PR은 `USE_MOCK=false`(mock 끈 상태)로** 올린다(CLAUDE.md §12·§13). mock 켠 채 배포하면 프로덕션이 가짜 데이터로 뜬다.
- **레포 루트가 아니라 `hard-click-frontend/`가 앱 루트.** Vercel 프로젝트의 **Root Directory 설정이 `hard-click-frontend/`를 가리켜야** 빌드된다. ⚠️확인: 대시보드 Root Directory 값.

---

## 5. 🙋 팀에 요청 — 코드로 못 채우는 값

> 아래는 **레포 밖에만 있는 사실**이라 담당자 확인이 필요하다. 확인되면 이 문서에 채운다.
> **실제 시크릿 값은 여기 쓰지 않는다**(레포 커밋 금지). 값은 Vercel 대시보드에만, 문서엔 `<TODO>` 자리표시만.

| # | 요청 항목 | 현재 상태 / 자리표시 |
|---|---|---|
| 1 | **프로덕션 배포 도메인 URL** | `<TODO: https://____.vercel.app 또는 커스텀 도메인>` |
| 2 | **Vercel에 세팅된 `NEXT_PUBLIC_API_BASE_URL` 실제값** (Production/Preview 각각) | `<TODO>` — Preview와 Production이 **다른 백엔드**를 보는지 확인 |
| 3 | **`NEXT_PUBLIC_TOSS_CLIENT_KEY` 세팅 여부** | `<TODO: 세팅됨/미세팅>` — **미세팅이면 결제가 조용히 mock으로 빠짐**(§2). 테스트키/라이브키 구분도 |
| 4 | **백엔드 주소 현행 여부** | `.env.example`엔 `http://13.125.94.217:8080` — ⚠️확인: 이 EC2 IP가 **현재도 유효**한지(재기동 시 IP 변동 가능·도메인 전환 여부) |
| 5 | Production 배포 트리거 브랜치 | `<TODO: develop? main?>` (§1) |
| 6 | Vercel Root Directory 설정 | `<TODO: hard-click-frontend/ 인지 확인>` (§4) |
| 7 | 영상 presigned **업로드** 엔드포인트 제공 여부 | `<TODO>` (§3) |

---

## 6. 배포 전 체크리스트

- [ ] `npm run build` 로컬 통과 (빈 `page.tsx` 없음 / 타입·lint 에러 없음)
- [ ] `USE_MOCK=false` (mock 끔 — 결제 등 실연동 유지)
- [ ] **시크릿에 `NEXT_PUBLIC_` 안 붙었는지** 재확인 (붙으면 번들에 평문 노출)
- [ ] Vercel Production env에 `NEXT_PUBLIC_API_BASE_URL` **실제 백엔드 값** 세팅 (없으면 `localhost` 폴백으로 전 API 실패)
- [ ] 결제 쓰면 `NEXT_PUBLIC_TOSS_CLIENT_KEY` 세팅 (없으면 mock 폴백)
- [ ] env 값을 바꿨다면 **재배포(재빌드)** 했는지 (`NEXT_PUBLIC_*`는 빌드 시 박힘)
- [ ] 큰 파일 업로드(영상)는 presigned S3 경로인지 (Vercel 4.5MB 제한 회피)
