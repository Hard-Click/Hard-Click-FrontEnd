# TESTING — 테스트 구성 & AI 사각지대

> 이 문서는 **코드만 봐서는 알기 어려운 것**만 적는다. 개별 테스트가 무엇을 검증하는지는 `*.test.tsx` 파일 자체가 문서다 — 여기서 나열하지 않는다.
> 대신 **AI가 틀리기 쉬운 3가지**를 다룬다: (1) Jest와 Playwright가 왜 파일 위치로만 갈리는지, (2) "정직성 회귀 테스트"가 무슨 개념인지, (3) mock E2E가 어떤 seam으로 도는지.

---

## 0. 두 계층 (한눈에)

| 계층 | 도구 | 위치 | 실행 | 무엇을 지키나 |
|---|---|---|---|---|
| **유닛/컴포넌트** | Jest + React Testing Library | `src/**/*.test.ts(x)` (구현 파일 옆 co-location) | `npm test` | 순수 로직(매퍼·훅·집계) + 컴포넌트 렌더 |
| **E2E (라이브)** | Playwright | `e2e/*.spec.ts` | `npm run test:e2e` | 실제 BE 붙은 브라우저 플로우 |
| **E2E (mock)** | Playwright | `e2e-mock/*.spec.ts` | `npm run test:e2e:mock` | **BE 없이** mock 데이터로 결정적 플로우 |

- 유닛은 구현 파일 **바로 옆**에 둔다(예: `MyRankingSummaryCard.tsx` ↔ `MyRankingSummaryCard.test.tsx`). 커버리지 대상은 `src/features/**`·`src/lib/**` — 순수 로직 계층 위주(`jest.config.ts` `collectCoverageFrom`).
- E2E는 `src/` **밖**(`e2e/`·`e2e-mock/`)에만 둔다. 이유는 §2.

---

## 1. 실행 명령

```bash
# 유닛 (Jest + RTL)
npm test                 # 전체
npm run test:watch       # watch
npm run test:coverage    # 커버리지
npx jest MyRankingSummaryCard   # 파일명/패턴으로 단건

# E2E (Playwright)
npm run test:e2e         # 라이브 — dev 서버(:3000) 자동 기동, 실 BE 필요
npm run test:e2e:mock    # mock — :3001에 mock 서버 기동, BE 불필요 (§3)
npx playwright test e2e/01_auth.spec.ts   # 단건
```

- `npm test` = `jest`. Playwright는 **별도 명령**이며 `jest`가 절대 건드리지 않는다(§2).
- 라이브 E2E의 `webServer`가 `reuseExistingServer`라 이미 `npm run dev`가 떠 있으면 재사용한다. mock E2E는 **항상 새로** 띄운다(`reuseExistingServer: false`, `playwright.mock.config.ts`).

---

## 2. ⚠️ AI 사각지대 ①: Playwright 스펙은 `e2e/`에만 — `jest`가 픽업하면 깨진다

**증상(왜 이게 함정인가):** Playwright 스펙(`test`/`expect`가 `@playwright/test`에서 옴)을 `src/` 안에 두거나 `*.test.ts`로 이름 붙이면, `jest`가 그걸 유닛 테스트로 오인해 **jsdom 환경에서 실행 → 즉시 깨진다**. 두 프레임워크의 `test`/`expect`는 이름만 같고 런타임이 다르다.

**방어선은 코드 두 곳에 이미 박혀 있다** — AI가 이걸 모르고 파일을 옮기면 무너진다:

1. **Jest는 `e2e/`·`e2e-mock/`를 통째로 무시** (`jest.config.ts`):
   ```ts
   testPathIgnorePatterns: [
     '<rootDir>/node_modules/',
     '<rootDir>/.next/',
     '<rootDir>/e2e/',        // ← Playwright 스펙 제외
     '<rootDir>/e2e-mock/',   // ← mock E2E 스펙 제외
   ],
   ```
2. **Playwright는 `e2e/`(라이브)·`e2e-mock/`(mock)만 스캔** (`testDir`). `src/`의 `*.test.tsx`는 애초에 안 본다.

**규칙(어기면 CI 깨짐):**
- Playwright 스펙 = **`e2e/` 또는 `e2e-mock/`에만**, 확장자 **`.spec.ts`**.
- 유닛 = **`src/` 안에만**, 확장자 **`.test.ts(x)`**.
- 위치와 확장자가 곧 프레임워크 배정이다. `src/` 안에 `.spec.ts`를 만들거나, `e2e/`에 `.test.ts`를 만들지 말 것.
- `e2e/`(라이브)와 `e2e-mock/`(mock)는 **포트·`testDir`까지 완전 분리**(:3000 vs :3001)라 서로 간섭 0. 팀 라이브 E2E를 건드리지 않고 mock 스펙을 추가할 수 있다.

---

## 3. mock E2E seam — BE 없이 결정적으로 도는 법

`npm run test:e2e:mock`은 `webServer`가 `NEXT_PUBLIC_E2E_MOCK=1`로 dev 서버(:3001)를 띄운다. 이 환경변수를 mock 레이어가 읽어 **도메인 무관 전면 mock**으로 전환한다:

```ts
// src/mocks/config.ts
const E2E_MOCK = process.env.NEXT_PUBLIC_E2E_MOCK === '1';
// E2E mock 실행(NEXT_PUBLIC_E2E_MOCK=1) 또는 전체 mock 프리뷰면 도메인 무관 mock
```

- 덕분에 BE가 안 떠 있어도, 500/미배포 도메인이어도 E2E가 **결정적**으로 돈다(예: `e2e-mock/02_admin_reports.spec.ts`).
- ⚠️ 이 seam은 **테스트/프리뷰 전용**이다. PR 전에는 `USE_MOCK` 계열이 꺼진(라이브) 상태여야 한다 — mock 켠 채로 올리지 않는다.

---

## 4. ⚠️ AI 사각지대 ②: 정직성 회귀 테스트 (가짜값·가짜완료 차단)

이 프로젝트 테스트의 **핵심 목적**은 "기능이 된다"가 아니라 **§0.1(연동 정직성 4대 금기)을 코드가 어겼는지 회귀로 막는 것**이다. AI가 "화면에 뭔가 뜨면 통과"로 리팩터하면 이 계약이 조용히 깨진다 — 그래서 테스트로 못질해 둔다.

정직성 테스트가 지키는 계약(코드만 보면 "왜 이렇게까지?" 싶은 부분):

### 예 1 — 가짜 완료 차단: `useWatchTimeSaver.test.ts`
`§0.1④`(안 되는데 되는 척 금지)의 회귀. **완료(`onCompleted`)는 시청 누적률 ≥90% + BE `completeVideo()`가 실제 200일 때만** 발화해야 한다. `setTimeout`으로 "완료된 척" 하지 않는다.

- `completeVideo` 실패(409/500) → `onCompleted` **미발화** (BE가 거절하면 완료 아님)
- 시청률 <90% → `completeVideo` **자체를 안 부름** (적게/짧게 봐도 완료 안 됨)
- `saveWatchTime` 실패 → 뒤 완료 로직까지 **진입 안 함**

> 시간 의존은 `Date.now`를 stub하고, 마운트는 반드시 **정지 상태로 시작**해 재생→정지 전환으로 flush를 유발한다(playing:true로 마운트하면 리셋 effect가 flush를 막아 헛통과).

### 예 2 — 미랭크 위조 차단: `MyRankingSummaryCard.test.tsx`
`§0.1②`(없는데 있는 것처럼 금지)의 회귀. BE가 아직 순위를 안 주는(`rank=null`→0으로 파생) 유저를 **"0위 · 전체 0명 · 상위 0%"로 위조하지 않고 "집계 전"으로 안내**하는지 검증.

- 정상 순위 → `"전체 M명 · 상위 P%"` 표시, `집계 전` 문구 **없음**
- `rank=0, totalUsers=0` → `"0위"` 대신 **`"집계 전"`** + `"아직 순위가 없어요"`
- `rank>0`인데 `totalUsers=0` 비정합도 **집계 전으로** 처리
- (별도 그룹) 활성 탭(`metric`)이 **올바른 지표 슬롯·라벨**을 고르는지 — 세 슬롯에 **서로 다른 값**을 넣어 검증(같은 값이면 매핑을 무시해도 통과하는 헛검증이 됨)

**새 연동을 짤 때 이 패턴을 따를 것:** 매퍼가 BE 미제공 필드를 기본값(0·''·false)으로 채우면, **그 값이 화면에 진짜처럼 렌더되지 않는지** 테스트로 고정한다("0위" ❌ / "집계 전" ✅).

---

## 5. 유닛 테스트 작성 규칙 (요약)

- **매퍼/집계는 순수 모듈로 뽑아** public 함수(`getXServer`·`summarizeScores` 등)를 테스트한다. `services`는 `jest.mock`으로 대체하고 mock 데이터를 주입한다.
- 컴포넌트는 RTL로 **사용자가 보는 텍스트/역할**을 검증한다. 커스텀 매처(`toBeInTheDocument` 등)는 `jest.setup.ts`가 `@testing-library/jest-dom`으로 활성화해 둠 — 별도 import 불필요.
- `@/` 별칭은 `jest.config.ts` `moduleNameMapper`가 `src/`로 매핑 → 테스트에서도 `@/...` 그대로 쓴다.
- `next/jest`가 SWC 변환·tsconfig 경로·환경변수를 자동 적용하므로 바벨 설정을 따로 두지 않는다.

---

## 6. ✅ / ❌ 체크리스트

✅ **하기**
- Playwright 스펙은 `e2e/`(라이브)·`e2e-mock/`(mock)에 `.spec.ts`로.
- 유닛은 구현 파일 옆 `.test.ts(x)`로, `@/` 별칭 그대로.
- **정직성 계약**(가짜값·가짜완료 금지)은 반드시 회귀 테스트로 못질.
- BE 없이 돌려야 하면 `npm run test:e2e:mock`.

❌ **하지 않기**
- `src/` 안에 `.spec.ts` 두기 / `e2e/`에 `.test.ts` 두기 (프레임워크 오배정 → 깨짐).
- "화면에 뭔가 뜨면 OK"로 정직성 어서션을 느슨하게 리팩터.
- 같은 값을 여러 슬롯에 넣어 매핑 검증을 무력화(헛통과).
- mock seam(`NEXT_PUBLIC_E2E_MOCK`) 켠 채로 PR.
