# CONVENTIONS — 코드 컨벤션 (TS 규칙 · 네이밍 · 컴포넌트 재사용)

> 이 문서는 **AI가 코드만 봐서는 모르는 규칙**(왜 이렇게 쓰는지·팀이 정한 값·재사용 판단 기준)만 적는다.
> 코드에 이미 뻔한 건(파일이 스스로 증명하는 것) 적지 않는다. 각 규칙의 근거는 실제 코드에 있으므로, 애매하면 예시 파일을 열어 확인한다.

---

## 1. TypeScript 규칙 (수업 자료 기반)

### 1.1 `interface` vs `type` — 형태로 갈린다

- **객체 모양 → `interface`.** 확장(extends)·선언 병합이 가능하고, 도메인 엔티티에 맞다.
- **유니언·튜플·별칭·매핑 → `type`.** `interface`로는 표현 못 하는 것들.

```ts
// 실제 features/rankings/types.ts 패턴
export interface RankingUser { rank: number; name: string; /* ... */ }   // 객체 = interface
export type RankingPeriod = 'daily' | 'weekly' | 'monthly';              // 유니언 = type
export type RankingBoard  = Record<RankingTabType, RankingUser[]>;       // 매핑 = type
```

> **왜 규칙으로 못 박나:** 둘 다 대부분 상황에서 동작하기 때문에 사람마다 섞어 쓰면 리뷰가 시끄러워진다. "객체는 interface, 그 외는 type"으로 **선택을 없앤다.**

### 1.2 `any` 금지 → `unknown` + 타입 가드

- **`any`는 쓰지 않는다.** (팀 §12 절대 금지 목록에 포함) 현재 `features`·`lib`·`services`에 `any` **0건**이 기준선이다 — 늘리지 않는다.
- 모르는 값(외부 응답·`catch (e)`·경계 입력)은 **`unknown`으로 받고 좁혀서** 쓴다.

```ts
// Server Action 경계처럼 신뢰할 수 없는 입력은 typeof 가드로 좁힌다
function isString(v: unknown): v is string { return typeof v === 'string'; }
```

> **왜:** `any`는 타입 검사를 **끄는** 것이고 `unknown`은 **검사를 강제**하는 것이다. BFF/Server Action 경계에서 BE 응답 shape를 가정만 하는 경우가 많은데, `unknown`+가드가 "여기는 검증 안 된 값"이라는 신호가 된다. (연동 정직성 §0.1과 짝)

### 1.3 함수 시그니처 = 문서

- **매개변수·반환 타입을 명시**한다. 특히 `services.ts`·`actions.ts`의 공개 함수. 타입만 봐도 무엇을 받고 뭘 주는지 읽히게.
- Server Action 반환은 상태 객체로 통일(`{ success: boolean; message?: string }` 계열).

### 1.4 제네릭 `ApiResponse<T>` — BE 응답 봉투(envelope)

모든 API 응답은 이 봉투로 감싼다. **실제 정의**(`src/services/api.ts`)는 아래와 같고, `data`의 실제 shape만 `T`로 갈아 끼운다.

```ts
export interface ApiResponse<T = unknown> {
  httpStatus: number;
  message: string;
  data: T;
  success: boolean;          // ⚠️ BE 필드 아님 — httpStatus < 400로 클라가 파생. 컴포넌트 호환용
  errorCode?: string;        // BE ErrorResponse.errorCode (예: USER_NOT_FOUND) — 에러에만
  details?: Record<string, unknown>;  // BE @Valid 실패 시 필드별 에러
}
```

> **코드로 모르는 사실(꼭 알아야 함):**
> - `success`는 **백엔드가 안 준다.** 클라 래퍼가 `httpStatus < 400`로 만든 파생값이다. BE 계약서에서 찾지 말 것.
> - `errorCode`/`details`는 **에러 응답에만** 있다 → 옵셔널. 성공 경로에서 참조하지 말 것.
> - 봉투 검증은 **`success` 공통 확인**이 기본이고, `data` 필수 여부는 **엔드포인트 타입 계약에 따른다.** 목록·상세처럼 성공 시 값이 반드시 있는 경우만 `!success || !data`로 막고(랭킹·찜 등에서 확립된 패턴), **빈 결과가 정상인 엔드포인트**(예: 유사퀴즈 오답 0건 → `data: null`, 204 No Content → `data` undefined)는 `!data`를 실패로 처리하지 않는다. (§0.1② — 정상 응답을 장애로 위장 금지)

### 1.5 동적 라우트 `params`/`searchParams` = Promise → `await` 필수

Next.js 15+에서 `params`·`searchParams`는 **Promise**다. `await` 없이 프로퍼티 접근하면 안 된다. (실제로 `app/**/[id]/page.tsx` 전반이 이미 이 형태)

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;   // ⚠️ await 빼먹으면 런타임에 터진다
}
```

### 1.6 유틸리티 타입 적극 사용

반복되는 형태는 손으로 다시 쓰지 말고 조합한다: `Partial` · `Required` · `Readonly` · `Pick` · `Omit` · `Record` · `Exclude` · `Extract`.
(예: `RankingBoard = Record<RankingTabType, RankingUser[]>`, 봉투 래퍼의 `Omit<ApiResponse<T>, 'success'>`.)

---

## 2. 파일 · 심볼 네이밍

| 대상 | 규칙 | 예 |
|---|---|---|
| 컴포넌트 파일 | `PascalCase.tsx` | `WishlistCard.tsx`, `QuizFormModal.tsx` |
| 훅 파일 | `useXxx.ts` | `useRegisterForm.ts` |
| Server Action 함수 | `xxxAction` | `createPostAction`, `refundAction`, `submitReportAction` |
| 도메인 폴더 파일 | `actions.ts` / `services.ts`(=서버 호출 `server.ts`) / `types.ts` / `schemas.ts` / `hooks.ts` | — |
| mock 파일 | `xxx.mock.ts` | `cart.mock.ts`, `rankings.mock.ts` |

> **왜 `xxxAction` 접미사를 강제하나:** 파일명·import 목록만 보고도 "이건 서버에서 도는 변경 작업(`'use server'`)"임을 즉시 구분하기 위해서다. 클라 헬퍼와 섞이면 실수로 클라에서 부른다.

- 라우트 세그먼트 폴더는 소문자·kebab. `PascalCase.tsx`는 **컴포넌트 파일에만**.
- ⚠️확인: 라우트 그룹 `(user)`처럼 괄호 폴더는 URL에 안 들어간다(구조 문서화용) — 파일명 규칙과 별개.

---

## 3. 컴포넌트 재사용 규칙 ⭐ (새로 만들기 **전** 필수 절차)

> 안현님 지시(§14). **모든 컴포넌트 작업의 첫 단계는 "이미 있는가?"를 확인하는 것.** 이걸 건너뛰고 새로 만들면 같은 모달·카드가 도메인마다 복제된다.

### 3.1 만들기 전 검색 순서

1. **`src/components/ui/`** — 디자인 시스템 기본 요소. 새로 만들기 전 여기부터 본다.
   현재 존재하는 것(중복 제작 금지): `button` · `input` · `label` · `textarea` · `select` · `SelectDropdown` · `checkbox` · `radio` · `badge` · `avatar` · `pagination` · `progress-bar` · `skeleton` · `spinner` · `tabs` · `tooltip` · `dropdown` · **`confirmModal`** · `doubleButtonModal` · `singleButtonModal` · `alrertModal`(파일명 오타 유지) · **`loadingModal`** · `empty-state` · `error-state` · `permission-state` · `toast`.
2. **`src/components/common/`** — 공통 조각.
   현재: `BackButton` · `PageTitle` · `SectionHeader` · `PriceText` · `RatingStars`(=StarIcon) · `StatusBadge` · `FormErrorMessage` · `NotFoundView` · `AuthHeader` · `RequireAuth` · `RequireRole`.
3. **다른 도메인 컴포넌트** — 성격이 같으면 가져와 props로 유연화.

### 3.2 판단: 재사용 vs 신규

- **있으면 재사용한다.** 모양이 조금 다르면 **props로 유연화**하고(기본값으로 기존 사용처 무영향 보장), 컴포넌트를 복제하지 않는다.
- **없을 때만 신규.** 신규를 만들었으면 왜 기존으로 안 됐는지 근거를 남긴다.
- **추가 "쪼개기"는 임의로 하지 않는다.** 스캐폴딩(빈 파일)이 이미 있으면 그 파일로 분리, 없는데 더 쪼개고 싶으면 **안현님 승인 후.**

### 3.3 실제로 이렇게 했던 사례 (판단의 기준선)

| 필요 | 재사용한 것 | 유연화 방식 |
|---|---|---|
| 삭제/신고 확인 모달 | `ui/confirmModal` | `icon` optional · `confirmVariant`(빨강/파랑) · `disabled` |
| 강의 카드(조회/등록 버튼만 다름) | `RecentCourseCard` | `actionLabel` / `actionHref` props화 (대시보드 기본값 무영향) |
| 강의 필터 드롭다운 | `ui/SelectDropdown` 로 추출 | 인라인 → 여러 필터바가 공유 |
| 삭제 중 로딩 | `ui/loadingModal` | 그대로 |
| 뒤로가기 | `common/BackButton`(`router.back`) | `arrowLeftIcon` + "이전으로 돌아가기" |
| 별점 | `common/RatingStars`(StarIcon) | `★` 글리프 대신 에셋 |
| 이름 마스킹 | `lib/formatter.maskName` | 신규 공용 유틸(서버 매퍼에서 호출) |

> `confirmModal`은 곽시윤 작(#6/#18)을 안현이 퀴즈 통일(#321)에 재사용하며 **공용 검증됨** — 이후 장바구니·찜·신고가 모두 이걸 쓴다. "이미 검증된 공용"을 늘려가는 게 목표.

---

## 4. 아이콘 = SVG (이모지 · 글리프 금지) ⭐

- **이모지(`✏️ 🗑 😀`)·문자 글리프(`▾ ← + ★`)를 UI에 쓰지 않는다.** 대신 `public/icons/`의 SVG 에셋을 쓴다.
- 적용: **먼저 `public/icons/`를 둘러보고** 맞는 에셋이 있으면 `next/image`로,

  ```tsx
  import Image from 'next/image';
  <Image src="/icons/error.svg" alt="error" width={18} height={18} />
  ```

  없으면 **인라인 `<svg>`** (예: 동적 색상이 필요하거나 에셋이 없을 때).

- 이미 있는 에셋(중복 요청 금지): `editIcon` · `trashIcon` · `searchIcon` · `arrowLeftIcon` · `chevronDownIcon` · `plus` · `saveIcon` · `heartFilledIcon` · `heartOutlineIcon` · `bookIcon` · `cartIcon` · `bellIcon` · `checkCircleIcon` · `starFilledIcon`/`starEmptyIcon` · `error` · `emptyStateIcon` · `grapghIcon`(오타 유지) 등. 전체는 `public/icons/` 목록 참조.

> **왜:** 이모지는 OS·폰트마다 렌더가 달라 디자인이 깨지고, 크기·색을 못 맞춘다. SVG 에셋은 `width`/`height`/색을 통제할 수 있고 `next/image`로 최적화된다. (성능 체크리스트 §13과도 연결 — 이미지 추가 시 `<img>` 아닌 `next/image`.)

---

## 5. 빠른 체크리스트 (작업 전/후)

**작업 전**
- [ ] 새 컴포넌트? → `components/ui` · `common` · 타 도메인 **먼저 검색** (§3.1)
- [ ] 아이콘 필요? → `public/icons/` 먼저 (§4)
- [ ] 타입: 객체=`interface`, 유니언=`type`, `any` 금지 (§1)
- [ ] `[id]` 라우트: `params`/`searchParams` **`await`** (§1.5)

**작업 후**
- [ ] 신규 컴포넌트를 만들었다면 "왜 기존으로 안 됐는지" 근거 남김
- [ ] 임의 추가 분리는 승인받았는지 (§3.2)

---

### 🙋 팀이 채워야 할 것 / ⚠️ 확인 필요

- **🙋요청**: `ui/` 컴포넌트 파일명 오타(`alrertModal` → `alertModal`) 정정 여부 — 현재 import 경로가 이 이름에 묶여 있어 일괄 리네임은 별도 작업.
- **⚠️확인**: `public/icons/`의 정확한 파일명은 폴더에서 직접 확인(위 목록은 자주 쓰는 것 발췌). 같은 개념에 에셋이 둘 이상인 경우가 있음(예: `search.svg`·`searchIcon.svg`·`commuSearch.svg`, `check.svg`·`checkDarkIcon.svg`·`checkCircleIcon.svg`) — 새로 추가 말고 맞는 것 선택.
- **⚠️확인**: `schemas.ts`(react-hook-form + zod)는 도입 선택 사항(§8 기준). 실제 사용 도메인에서 스키마 네이밍 컨벤션 확정 필요.
