# CLAUDE.md — `features/payments` (결제)

> 폴더별 AI 컨텍스트. **코드로 뻔한 건 안 적는다.** 여기 있는 건 *코드만 봐선 틀리기 쉬운 사실* — 외부 값·보안 규칙·BE 실제 동작·정직성 규칙뿐이다.
> 상위 규칙은 루트 `CLAUDE.md`(특히 §0.1 연동 정직성 4대 금기, §5 Server Action/BFF) 참조.

**파일 지도(빠른 참조)**

| 파일 | 실행 위치 | 역할 |
|---|---|---|
| `toss.ts` | **client 전용** | 토스 SDK v1 로더 · `TOSS_CLIENT_KEY` |
| `components/PaymentButton.tsx` | client | 주문 재발급 → `requestPayment` 호출(잎사귀) |
| `actions.ts` | `'use server'` | `confirmPaymentAction`(최종 승인 중계) · `refundAction` |
| `server.ts` | Server Component 전용 | 결제내역/주문상세 조회 + 격리막 매퍼 |
| `types.ts` | 공용 | UI 계약 타입(BE shape ≠ UI 계약) |

관련 파일(이 폴더 밖): 주문 발급은 `features/orders`(`createCheckoutOrderAction`), successUrl 착지는 `app/(user)/payment-result/PaymentResultClient.tsx`.

---

## ⚠️ AI 사각지대 (코드만 봐선 모르는 것)

### 1. 토스 SDK v1 — 키 배치 규칙 (보안, 절대 어기지 말 것)

- 프론트가 초기화에 쓰는 건 **Client Key 하나뿐**이다. 값은 `NEXT_PUBLIC_TOSS_CLIENT_KEY` 환경변수로 주입.
- ⛔ **시크릿 키(Secret Key)는 프론트에도 Git에도 절대 두지 않는다.** 시크릿으로 하는 **토스 최종 승인은 백엔드가** 한다(아래 흐름 참조). `NEXT_PUBLIC_` 접두사에 시크릿을 넣는 실수 금지 — 브라우저에 노출된다(`docs/WORKFLOW.md` §7 환경변수).
- SDK 스크립트(`https://js.tosspayments.com/v1/payment`)는 `loadSdk()`가 **런타임에 1회만** `document.head`에 주입한다. → CSP/네트워크 차단 환경(예: Artifact 프리뷰)에선 로드 실패할 수 있음.
- **`NEXT_PUBLIC_TOSS_CLIENT_KEY`가 비면(`''`) 실결제 흐름이 통째로 비활성**된다. 코드가 조용히 mock 폴백으로 빠지므로(§4), 실결제를 기대했는데 mock이 돌면 **이 환경변수부터 의심**.
  - 🙋요청: 팀의 **테스트/라이브 Client Key** 값과, 어느 배포 환경(Vercel preview/production)에 세팅돼 있는지. ⚠️확인: 이 레포에는 `.env.example`에만 있고 실제 키 세팅 여부는 배포 환경 변수에 달림.

### 2. 결제 흐름 — "누가 무엇을 검증하나" (코드 3개 파일에 흩어져 있어 전체 그림이 안 보임)

```
[client] PaymentButton
  └ 결제 시점에 주문 재발급  createCheckoutOrderAction(type, courseIds)  ← features/orders
      · 이유: 결제 직전의 선택분으로 orderNo·금액을 새로 발급해야 토스 결제액과 주문 총액이 일치
      · 안전장치: 발급 order.amount ≠ 화면 amount 면 결제 중단(§0.1 — 표시액보다 더 청구 방지)
  └ toss.requestPayment('카드', { orderId: order.orderNo, amount, successUrl, failUrl })
      · successUrl엔 type·courseIds만 실음. paymentKey·orderId·amount는 토스가 덧붙여 리다이렉트
      · courseIds는 요청값이 아니라 **실제 발급된 주문(order.courseIds)** 로 구성 → 주문과 등록 어긋남 방지
        │
        ▼ (토스 결제창 → successUrl 리다이렉트)
[client] PaymentResultClient  →  confirmPaymentAction (Server Action)
[server] confirmPaymentAction
  └ POST /api/payments/confirm { paymentKey, orderId, amount }   ← BE가 금액 검증 + 토스 최종 승인 중계
  └ (강의) 승인 성공 & 중복 아님 & courseIds 있음 → POST /api/enrollments {courseId} 를 각각
```

코드만 봐선 놓치는 계약 사실:

- **BE `/api/payments/confirm` 바디는 `{paymentKey, orderId, amount}` 3개뿐** (orderId 기반 검증·승인). 주문이 여러 강의를 담아도 confirm은 **orderId 1건**으로 처리된다. `courseIds`는 confirm 바디에 **안 들어가고**, 승인 성공 *후* FE가 `/api/enrollments`로 강의마다 따로 등록하는 데만 쓴다.
  - ⚠️확인: OpenAPI 스키마는 `courseId/amount`만 명시하나, 라이브 BE는 `paymentKey`도 실제로 사용한다(actions.ts 주석 근거).
- **결제 경로는 복수형 `/api/payments/*`로 통일**(2026-06-29, BE main). 단수 `/api/payment/me`는 500(C002) — 결제내역이 안 뜨던 버그였음. 새 코드에서 단수 경로 쓰지 말 것.
- **수강 등록(enroll)은 멱등 처리**되어야 한다. successUrl 새로고침 등으로 confirm이 재호출되면 `res.data.duplicate=true` → 재등록 생략. 보유 강의 재등록 시 BE는 **409 EN001("이미 수강 중")** — 이건 실패가 아니므로 경고하지 않는다(라이브 검증 2026-06-27). 그 외 등록 실패는 `enrollWarning`으로 사용자에게 노출한다(§0.1④ — 결제됐는데 미등록을 조용히 숨기지 않음).
- **구독 결제**: `courseIds` 없이 confirm만 호출하면 **BE가 confirm 시점에 구독권을 지급**한다(`dispatchAccessGrant()`→`subscribeUseCase.handle()`, BE 확인 2026-06-27). 그래서 구독은 FE 수강등록 호출이 없다.

### 3. Idempotency-Key — 중복 승인/환불 방지 (왜 매번 UUID를 붙이는지)

- `confirmPaymentAction`(승인)과 `refundAction`(환불)은 BE 호출마다 **`Idempotency-Key` 헤더에 `randomUUID()`** 를 싣는다. 결제/환불은 **파괴적·비멱등** 연산이라, 네트워크 재시도·중복 요청이 이중 승인/이중 환불로 이어지지 않게 BE가 이 키로 막는다.
- ⚠️ 실제 멱등 판정은 BE 몫 — FE는 키를 제공만 한다. 같은 논리 요청에 **같은 키를 재사용해야** 진짜 멱등인지(현재는 호출마다 새 UUID) 여부는 BE 동작에 달림. ⚠️확인.

### 4. ⛔ 결제 mock 규칙 & 현재 상태 (정직성 — "되는 척" 금지, §0.1④)

> 팀 규칙(2026-07-20 안현 확정): **강의·구독 둘 다 실토스 실결제** — "구독은 mock" 금지. 아래는 *실제 코드가 지금 무엇을 하는지* 그대로다(문서용 이상론 아님).

- **mock 폴백은 도메인이 아니라 "Client Key 유무"로 갈린다** (`PaymentButton`):
  - `TOSS_CLIENT_KEY`가 세팅됐고 `type==='course'`(+선택분 1개↑) → **실토스** 흐름.
  - 키가 있으면 `type==='subscription'`도 **실토스 경로(`canTossSub`)** 를 탄다 → confirm이 구독권 지급. (구독 실결제 — 확정 정책과 일치)
  - **키가 비면(그 외 전부)** → `setTimeout(1200ms)` 후 성공 화면으로 보내는 **가짜-성공 mock**. 이건 처리 흐름만 재현하는 것이므로, 실결제로 오해하지 말 것.
  - ✅ **정책 확정(2026-07-20)**: 구독도 실토스가 맞다. 과거 "구독=mock" 서술은 폐기 — 코드(키 있으면 구독 실토스)가 정본이다.
- **`isMock('payments')` 게이트**(`config.ts`): 현재 `payments: false`(실 confirm), `orders: false`(실 orderNo 발급). 즉 mock config상으론 라이브지만, **Client Key가 없으면** `PaymentButton`이 위 가짜-성공으로 폴백한다 — 두 스위치가 **독립적**이니 헷갈리지 말 것.
- `confirmPaymentAction`/`refundAction`도 `isMock('payments')` true면 실제 호출 없이 성공/판정만 반환한다(주석에 mock 명시).
- **PR 전 mock 게이트 확인**(`docs/DEPLOYMENT.md` §6 체크리스트). mock 상태로 결제 코드를 올리지 않는다.

### 5. 환불 — BE 모델이 "항목별"이라는 게 코드로 안 드러남 (`refundAction`)

- **강의 환불은 per-item** — `POST /api/order/{orderId}/items/{courseId}/refund` 를 **courseId마다 반복 호출**한다(부분환불=여러 번). body 없음, `Idempotency-Key` 헤더만.
- **구독 환불은 주문 단위** — `POST /api/order/{orderId}/refund`(courseId 없음). 구독 주문은 `order_items`가 없어 per-item이 불가 → BE 별도 엔드포인트(`OrderController.refundSubscription`, BE 코드 `ba34f83` 검증).
- **`reason`은 BE가 받지 않는다**(엔드포인트에 body 없음) — FE 입력·표시용일 뿐. UI에 "사유 필수"로 받아도 서버엔 안 간다.
- **환불 가능 판정은 UI 1차 차단 + 서버 2차 안전망 2겹.** BE는 "본인이 결제한 PAID 주문의 `refundable` 항목"만 정상 처리하고, 그 외엔 오류를 낸다. `OrderRefundView`가 refundable 항목만 보내고 불가 항목은 호출 전 모달로 막는다. 400/409는 규칙 위반(`blocked` — 안내 모달), 그 외는 처리 오류(`error` — 토스트)로 구분한다.
- ⚠️ **구독 실 환불 호출은 파괴적이라 미테스트** — BE 코드 시그니처(`ba34f83`) 기준으로만 배선. 라이브 성공 여부 미확인. 🙋요청: 환불 가능한 구독 주문 시드로 1회 라이브 검증.

### 6. `server.ts` 매퍼 — BE 미제공 필드를 "없는데 있는 척" 안 함 (§0.1②)

BE `GET /api/order/{orderId}` 응답에는 아래가 **없어서**, 매퍼가 폴백/숨김/정적문구로 처리한다(가짜 데이터 렌더 금지):

| UI 필드 | BE 실제 | 처리 |
|---|---|---|
| `item.title` (null로 옴, 시드) | 종종 null | `강의 #{courseId}` 폴백 |
| `item.instructor` | 미제공 | `''` → 컴포넌트가 빈 값이면 숨김 |
| `paymentMethod` | 미제공 | `''` → 행 숨김 |
| `refundConditionNote` | 미제공 | **정적 정책 문구**("7일 이내·진도율 10% 미만") — 허위 수치 아님 |
| `orderId` | 응답에 없음 | **URL 파라미터로 보강** |

- **구독 주문은 BE가 `order_items`를 영속화 안 함(빈 배열)** → 매퍼가 표시용 "FLOWN 구독권" 라인 1개를 **합성**(금액=실 `totalAmount`). ⚠️ 합성 항목은 `refundable=true`로 표시되지만, **현재 BE는 구독 주문 item이 없어 per-item 환불이 `ORDER_ITEM_NOT_FOUND`** — 구독 환불은 별도 엔드포인트(§5)로만 가능. BE가 구독 item을 제공하면 이 합성은 제거되고 실 item으로 동작.
- **삭제된 강의 결제 행**은 `orderId/orderNo/paymentType`(+FAILED는 `paidAt`)이 **null**로 내려온다 → 매퍼·카드가 null 가드(상세 이동 불가). `types.ts`의 `orderId: number | null` 등이 이래서 nullable.
- **상태 철자 정규화**: BE가 `CANCELLED`(L 2개)로도 주는데 UI 계약은 `CANCELED`(L 1개) → `normalizeStatus`가 흡수.
- ⚠️ 결제내역 `GET /api/payments/me`는 **페이지네이션 미적용**(첫 page 10건만) — 추후 과제.

---

## 손대기 전 체크 (self-audit)

1. 실결제인 줄 알았는데 mock이면 → **`NEXT_PUBLIC_TOSS_CLIENT_KEY` 유무**(§1·§4)부터 확인.
2. 결제/환불 BE 호출을 추가하면 → **`Idempotency-Key` 헤더**(§3) 잊지 말 것.
3. confirm 바디에 `courseIds`를 넣지 말 것 — 승인 *후* enroll이 따로 처리(§2).
4. BE 미제공 필드를 기본값으로 채워 렌더하지 말 것 — 폴백/숨김/정적문구로(§6, §0.1②).
5. PR 전 `USE_MOCK`·`payments`/`orders` override·Client Key 상태 원복 확인(§4).

---

작성 근거 파일(절대경로):
- `src/features/payments/toss.ts`
- `src/features/payments/actions.ts`
- `src/features/payments/server.ts`
- `src/features/payments/types.ts`
- `src/features/payments/components/PaymentButton.tsx`
- `src/app/(user)/payment-result/PaymentResultClient.tsx`
- `src/mocks/config.ts`

⚠️ 코드와 MEMORY가 어긋난 지점(문서에 ⚠️확인으로 반영): mock 폴백이 "구독=mock"이 아니라 **Client Key 유무**로 갈린다 — 키가 있으면 구독도 실토스 경로를 탄다. "구독은 mock 유지" 원칙을 지키려면 코드에서 구독 경로를 명시적으로 막아야 함(현재 미적용).
