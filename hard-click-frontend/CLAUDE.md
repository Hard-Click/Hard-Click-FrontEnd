# CLAUDE.md — FLOWN(Hard-Click) 프론트엔드

> **이 파일은 규칙을 담지 않고 라우팅만 한다.**
> 전체 규칙을 한 파일에 몰아넣으면 아무도(사람도 AI도) 끝까지 안 읽는다.
> 여기엔 **모든 작업에 공통으로 적용되는 것**만 두고, 나머지는 작업 종류에 맞는 문서로 보낸다.

**⚠️ 위치:** 저장소 루트가 아니라 **`hard-click-frontend/`** 하위에 앱이 있다. 모든 명령은 이 폴더에서 실행한다.

```bash
cd hard-click-frontend
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # eslint
npx jest         # 유닛 테스트
```

**스택:** Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind v4 · axios · sonner
**백엔드:** Spring Boot. 베이스 URL은 `NEXT_PUBLIC_API_BASE_URL`.

---

## 0. 가장 중요한 원칙 (3줄 요약)

1. **서버 우선(Server-First).** 화면은 기본 **Server Component**, `'use client'`는 상호작용이 필요한 **잎사귀(버튼·폼·입력)** 에만 붙인다.
2. **데이터 변경(CUD)은 Server Action + BFF.** 브라우저가 백엔드(Spring Boot)를 직접 부르지 않는다. **Next.js 서버가 중계**한다.
3. **인증 토큰은 httpOnly 쿠키.** `localStorage`에 토큰을 저장하지 않는다. (XSS 방지)

---

## 0.1 ⛔ 연동 정직성 4대 금기 (API 연동 시 **반드시** 준수) ⭐

> 안현님 지시(2026-06-24). **모든 API 연동 작업에서 이 4가지를 어기면 안 된다.** 어겼는지 스스로 점검하고, 어쩔 수 없이 해당되면 **반드시 사용자에게 명시**한다. "되는 척" 금지 — 안 되면 안 된다고 말한다.

1. **추측 금지** — 라이브 검증 없이 엔드포인트 경로/요청 바디/응답 shape/동작을 **가정하지 않는다.** 연결하는 모든 경로는 **실제로 라이브 호출해 200·shape를 확인**한 뒤 연결한다. 검증 못 했으면 "검증 안 됨"이라고 코드 주석·사용자 보고에 명시(추측 shape면 `// 가정 shape` 표기).
2. **없는데 있는 것처럼 금지** — BE가 **안 주는 필드를 기본값(0·''·false·가짜 숫자)으로 채워 UI에 진짜처럼 렌더하지 않는다.** 매퍼가 기본값을 넣어야 하면, 그 값이 **화면에 노출되는지(uiVisible)** 추적하고, 노출되면 "BE 미제공 → 표시 안 함/안내 문구" 처리하거나 사용자에게 알린다. (예: `rank=null`을 "0위"로 표시 ❌, "집계 전" ✅)
3. **요청/범위 밖 UI 수정 금지** — 연동하면서 요청받지 않은 시각/레이아웃/문구/동작을 **임의로 바꾸지 않는다.** UI 변경이 필요하면 **사용자 승인 후**. (격리막 패턴: 연동은 server/services/actions만 건드리고 컴포넌트는 무변경이 기본)
4. **안 되는데 말 안 하기 금지** — mock이거나, BE 500/미배포라 폴백 중이거나, 가짜-성공(setTimeout 등)이거나, 죽은 스텁이면 **코드 주석 + 사용자 보고에 반드시 명시.** 장애를 빈 상태로 조용히 숨겨 "정상인 척" 하지 않는다. config `isMock`/`MOCK_OVERRIDE`로 mock 여부를 정확히 반영하고, 주석이 실제 동작과 **반대로** 남지 않게 한다.

**점검 습관:** 연동 끝나면 위 4개로 self-audit → 걸리는 게 있으면 (a)고치거나 (b)사용자에게 "이건 이래서 이렇다"고 보고. 라이브 검증은 **BE 레포 코드 + 실제 호출 둘 다**(라이브 ≠ Swagger ≠ 계약문서).

> 이 규칙은 문서로만 있지 않다. 소스 주석에서 `§0.1`을 근거로 인용한 곳이 **72곳 · 42개 파일**이고,
> 테스트 이름에도 박혀 있다(`'/me 조회 실패면 statusKnown=false — 미구독으로 위장하지 않는다(§0.1④)'`).
> 되돌리려는 변경은 테스트가 깨져서 리뷰에서 걸린다.

---

## 1. 어디를 읽어야 하나 (라우팅)

### ① 도메인 코드를 만질 때 → `src/features/{도메인}/CLAUDE.md`

**"코드만 봐서는 틀리기 쉬운 것"만** 적혀 있다. 파일 구조·타입처럼 코드를 보면 아는 건 안 적는다.
이 세 도메인에만 존재한다:

| 문서 | 담긴 것 |
|---|---|
| `src/features/auth/CLAUDE.md` | 토큰은 httpOnly 쿠키에만(`localStorage` 금지) · 토큰 첨부는 서버가 · 401 재시도는 1회(single-flight) · `redirect()`는 try/catch **밖** |
| `src/features/payments/CLAUDE.md` | 토스 SDK 키 배치 규칙 · 결제 흐름의 검증 주체 · `Idempotency-Key`를 매번 붙이는 이유 · 환불이 BE **항목별** 모델인 것 · 가짜 성공 금지 |
| `src/features/learning/CLAUDE.md` | HLS 3분기 재생 · watch-time 누적(heartbeat + 내비 분기) · **"완료"는 서버 성공 시에만** · 순공 타이머 연동 |

### ② 작업 종류에 따라 → `docs/*.md` (팀 규칙 5종 + 작업 로그)

| 문서 | 언제 읽나 |
|---|---|
| `docs/CONVENTIONS.md` | 코드 쓸 때 — TS 규칙(`any` 금지) · 네이밍 · **새 컴포넌트 만들기 전 재사용 확인 절차** · 아이콘은 SVG |
| `docs/ARCHITECTURE.md` | 구조를 바꿀 때 — Server-First인 이유 · **격리막(`USE_MOCK`) 패턴** · BFF passthrough · 표준 도메인 4파일 · Provider 패턴 |
| `docs/WORKFLOW.md` | 올릴 때 — 이슈 → 브랜치 → 커밋 → PR → 리뷰 1+ → 머지 · 라벨 · 이슈/PR 템플릿 · **절대 금지 목록** |
| `docs/TESTING.md` | 테스트 쓸 때 — Jest/Playwright 두 계층 · **Playwright 스펙은 `e2e/`에만** · 정직성 회귀 테스트 |
| `docs/DEPLOYMENT.md` | 배포·환경변수 — Vercel 기준 · `NEXT_PUBLIC_*`는 빌드에 박힌다 · 4.5MB 요청 제한 |
| `docs/WORK_LOG.md` | **작업 후 필수 기록** — 무엇을 / 어디서 어디로 / 왜 (§3-3) |

### ③ 요청받았을 때만 → 이 체인 밖의 문서

- `docs/BE_*.md` · `docs/be-ticket-*.md` — 백엔드 요청·버그 티켓 (1회성 기록)
- `docs/발표_*.md` · `docs/시연_*.md` — 발표 자료 (표준 규칙 아님)

---

## 2. 디렉터리 한 장 요약

```
src/
├─ app/                      라우트 (폴더 = URL)
│  ├─ (user)/ instructor/ admin/    역할별 라우트 그룹
│  └─ api/[...path]/         BFF 프록시 — 브라우저의 유일한 출구
├─ features/<도메인>/        도메인마다 같은 4파일 ⭐
│  ├─ types.ts               UI가 보는 계약 (컴포넌트엔 이것만 노출)
│  ├─ server.ts              BE 응답 타입 + 매퍼  ← 격리막
│  ├─ actions.ts             'use server' 변경 작업
│  └─ components/            이 도메인 전용
├─ components/ui/            공용 컴포넌트
├─ lib/                      api · formatter · toast · utils
└─ mocks/                    도메인별 mock + isMock() 스위치
```

**격리막이 핵심이다.** BE 응답 모양이 바뀌어도 고치는 파일은 `server.ts` 하나이고 컴포넌트는 무변경이다.
자세한 건 `docs/ARCHITECTURE.md`.

---

## 3. 새 작업 시작 전 3가지

1. **재사용 확인** — 새 컴포넌트 만들기 전에 `components/ui/`·`components/common/`·다른 도메인에 같은 게 있는지 본다. (`docs/CONVENTIONS.md` 3장)
2. **구조 확인** — 빈(0바이트) 파일은 **분리 의도된 스캐폴딩**이다. 인라인으로 몰린 컴포넌트가 있으면 그 파일로 분리한다.
3. **작업 후 기록** — 무엇을 / 어디서 어디로 / 왜 했는지 `docs/WORK_LOG.md`에 남긴다.
