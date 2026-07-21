# 컴포넌트 작업 로그 (기능별)

> 기존 CLAUDE.md §15에서 이동. 항상-로드되는 CLAUDE.md를 짧게 유지하기 위해 상세 작업 이력은 여기로 분리.
> 형식: **[무엇] — [위치 전→후] — [왜]**


> 형식: **[무엇] — [위치 전→후] — [왜]**

### auth (회원가입)
- `RegisterForm` 2076→1575: 인라인 `DatePickerInput`·`RegisterStepIndicator`·`TermsModal` + 공유 타입/유틸(`registerForm.shared`) 분리 — 파일이 너무 길어 가독성↓ (PR #292)
- `RegisterForm` 추가 분리 (이슈 #293, 안전모드 — 순수 move + 단계별 검증):
  - ✅ **Tier1**: 하부 로컬 UI 컴포넌트 13개(`BrandLogo`·`IconInput`·`PasswordInput`·`StatusText`·`AgreementRow` 등) → `registerForm.ui.tsx` 분리. 순수 표시용 이동. **1575→1203줄**. tsc 0·eslint 깨끗·렌더 200 검증 완료.
  - ✅ **Tier2**: 로직(state 20개+·핸들러 9개·타이머) → `useRegisterForm.ts` 훅 분리(순수 move). **1203→677줄**. tsc 0·eslint·렌더·입력동작(비번 검증) 검증 완료.
  - ✅ **Tier3**: 각 단계 JSX → `RegisterStep1~3` 컴포넌트 분리(순수 move, `{...form}`으로 props 전달, 타입 `UseRegisterFormReturn`). RegisterForm은 오케스트레이터로 **677→63줄**. tsc 0·eslint·렌더·입력동작 검증 완료.
  - **최종**: RegisterForm **1575→63줄**. 구조: `RegisterForm`(오케스트레이터 63) + `useRegisterForm.ts`(로직 640) + `registerForm.ui.tsx`(UI 394) + `RegisterStep1~3`(단계뷰 171/204/273). 커밋 `8a2ec13`·`d791414`·`3543b11`. → 수업자료 정석 구조(오케스트레이터+훅+leaf).

### users (프로필)
- `ProfileEditModal` 1004→749: `ProfileImageUploader`(이미지 스텝)·`PasswordChangeForm`(비번 스텝)·`PwField`(비번 입력, 공용) 분리 (PR #292)

### courses / instructor (강의상세)
- 학생: `CurriculumAccordion`→`CourseCurriculumSection` / 강사: →`InstructorCurriculumSection` 분리 (PR #292)

### common (공통)
- `RatingStars`(StarIcon/StarRow): 학생·강사 강의상세 중복 제거(dedup) / `SectionHeader`: 마이페이지에서 분리 (PR #292)

### 코드리뷰(CodeRabbit) 피드백 — 핵심 2개만 반영 (사용자 결정)
토끼봇이 9개 지적했으나 **실사용자 영향 있는 2개만 유지**, 나머지 7개는 사소·안보임·한국 미발현이라 제외.
- ✅ **#1** `reviews/services.ts`: 실서버 호출 `page`→`page-1` (1-based→0-based, 기존엔 한 페이지 밀림) — 커밋 3e9d61c
- ✅ **#2** `courses/[courseId]/page.tsx`: 공지 병렬조회 `.catch(()=>({notices:[]}))` 폴백 (공지 실패가 강의 상세 전체를 막지 않도록) — 커밋 3e9d61c
- ❌ **제외**: #3 학습시작 버튼 조건(이미 push돼 원복 커밋 ea93064)·#4 타임존(한국 미발현)·#5 파일재선택·#6 강의시간·#7 PwField a11y·#8 mock currentPage·#9 TermsModal a11y — 미푸시분(eeed804·8e1165d)은 reset으로 drop. (필요 시 #292 CodeRabbit 코멘트에 전부 기록 남아있음)

### instructor (강사 퀴즈) — 기능별 분리 진행
- **Screen 1 강의 목록 페이지** (이슈 #311 / PR #312, 커밋 9ffc05f): `app/instructor/quizzes/page.tsx` 신규 — **Server Component**로 `getInstructorCoursesServer` 서버 조회 (useEffect 페칭 X, `RecentCourseSection`의 CSR 안티패턴 답습 안 함). 강의 카드 = `RecentCourseCard` 재사용(버튼 `actionLabel`/`actionHref` props화 → "조회"/`quizzes/[id]`, 대시보드 기본값 무영향). 강사 헤더 아이콘 크기 통일(notices·dashboard, 팀 작업분 동반). **use client 0** · ⚡최적화 대상 없음(SVG 아이콘 — 이미지 추가 시 next/image).
- **Screen 2 강의별 퀴즈 목록** (이슈 #317 / PR #318, 커밋 a49686a): `app/instructor/quizzes/[courseId]/page.tsx`(Server·강의명 동적 조회) → `QuizListContent`(client·주차 필터/삭제) → `QuizListItem`·`QuizEmptyState`. **공용 `ui/SelectDropdown` 추출**(`InstructorCourseFilterBar` 인라인 → 강의 필터바와 공유) · 삭제=`DoubleBtnModal` 재사용 · 빈 상태=공용 EmptyState 형식 · 이모지→SVG(`editIcon`/`trashIcon`/`searchIcon`/`arrowLeftIcon`). **데이터 계층**(types/mock/server/actions) `USE_MOCK` 분기로 API 스왑 격리 → 연동 시 `server.ts`/`actions.ts`만 수정(UI 무변경). ⚡최적화 대상: 강의명 over-fetch(`getInstructorCoursesServer`→추후 단건 API). 코드리뷰 반영(c4f4f11): 삭제 응답 `success` 검증·입력 검증(양의 정수)·`toQuiz` 매퍼 추가(ApiQuiz 가정→명세 시 조정)·실서버 분기 정렬 일관성.
- **등록/수정 모달** (이슈 #321 / PR #322, 커밋 8f3b374): `QuizFormModal`(등록·수정 겸용 `mode`+`initialData`) ← `QuizQuestionFields`(문제 1개) + `FieldError`(에러 텍스트) / `QuizCreateButton`(헤더 등록 버튼). 동적 문제 추가/삭제 · 문제·보기4·정답·해설 **전부 필수** · 검증(빈칸 에러 + 첫 에러 스크롤 + 입력 시 live-clear) · 데이터 `QuizFormPayload`+`createQuizAction`/`updateQuizAction`(USE_MOCK 격리). 재사용 `SelectDropdown`·`DoubleBtnModal`·`LoadingModal`, 아이콘 SVG(`saveIcon`·`plus`·`trashIcon`·`error`). **errors=파생값**(`submitted ? validate() : null`)으로 effect 회피(lint "no setState in effect" 만족). Screen 1·2 등록 버튼 + Screen 2 카드 수정 연결. ⚡최적화 대상: 문제 `key=index`→안정 id, 주차 1~12 고정→API 때 강의 섹션. **코드리뷰 반영(16a0158)**: courses `{courseId,title}`만 클라 전달 · 서버 payload 문항 단위 검증 · 로딩 `try/finally` · props **판별 유니언**(edit `initialData` 강제) · a11y(모달 `role=dialog`·label `htmlFor`·정답 `aria-pressed`). 스킵(이유): `@/`별칭→상대경로(코드베이스가 `@/` 사용, 일관성), 수정 후 목록 즉시갱신(mock 정적 한계, API revalidate가 처리), `options` 4-tuple(서버 런타임 체크로 대체). **2차 리뷰(16ef44d)**: 저장 액션 `catch`(reject 대비) · payload `typeof` 가드(Server Action 경계 throw 방지) · `explanation` 주석 '선택'→'필수' 정합. (`unknown` 풀 리팩터는 trusted 클라+mock 단계엔 과해 typeof 선에서 적정화). **UX 개선(b656a7a)**: 삭제·등록·취소 확인 모달을 공용 `ConfirmModal`로 통일(icon optional·`confirmVariant`(빨강/파랑)·`disabled` 확장, 기존 3곳 하위호환) — 퀴즈삭제(빨강)/문제삭제(휴지통)/등록확인(초록체크)/작성취소 · **1주 1퀴즈** 주차 중복 방지(`getTakenWeeksByCourseServer`, Screen1=강의 선택/Screen2=강의 고정[presetCourseId], 강의 골라야 주차 활성, 수정=강의·주차 고정) · **모달 겹침 방지**(확인/로딩 시 폼 숨기고 early-return으로 1개만 렌더, 취소 시 입력값 유지하며 복귀). ⚡주차 상한 1~12(mock)→API 강의 커리큘럼 연동 시 실제 주차수. **3차 리뷰(800b9aa)**: A=SelectDropdown disabled 시 열린 메뉴 렌더 차단(`{isOpen && !disabled}`), B=강의 주차 전부 소진 시 `noWeeksAvailable`로 '등록 가능 주차 없음' 안내+주차 비활성·등록 차단(stuck 모달 방지). 보류: server.ts `{}`(실서버 미구현=API 단계 TODO)·`@/` alias(코드베이스 일관성). **#325(분리 PR)**: A·B를 #322 머지(GwakSiyun, 17:42) 직후 푸시해 못 실림 → develop 기준 새 브랜치에 cherry-pick해 별도 PR(#325)로 재상정. 토끼 후속 `de493b3`=disabled 전환 시 `isOpen` **렌더 중 정리**(`if (disabled && isOpen) setIsOpen(false)`, 열린 채 비활성→재활성 메뉴 튐 방지, effect 아닌 React 권장 패턴이라 lint 안전).
- **퀴즈 점수 현황** (이슈 #327 / PR #330 / 브랜치 `feature/instructor-quizScores#327`): Screen2 카드 [조회하기] → `/instructor/quizzes/[courseId]/[quizId]`. 한 퀴즈 응시 결과. **Server page**=조회(`getQuizScoresServer`, 없으면 `notFound`)+집계(`summarizeScores`)+합성 / **client는 표만**(`QuizScoresTable`). 구성: 헤더(바차트 아이콘+제목+이전으로+브레드크럼 `강의›N주차:제목`) / 통계 3카드(응시·미응시·평균, `QuizScoreOverview` 표시용 server) / 점수 분포 막대(90~100·70~89·50~69·0~49, **응시자 기준** %) / 수강생 표(검색[이름·아이디] + 정렬 드롭다운[점수↑/↓·이름] + **응시여부 필터**[전체/응시/미응시] 따로, 정적). `scoreboard.ts`=구간(`SCORE_BUCKETS`)·배지색(`scoreBucket`)·집계(`summarizeScores`) 공용 순수모듈(server·client 양쪽 import). mock=`quizScores.mock`(quizId별, 미등록 quizId도 기본세트로 표시). 미응시=점수정렬 시 맨 아래·점수/제출일 `-`. **이름=실명**(강사 화면이라 마스킹 X — 본인 학생 식별 필요. 디자인 목업의 마스킹은 미적용). `onView` toast→`router.push`. 색·구간은 SCORE_BUCKETS 단일 소스.
- (후속) 퀴즈 상세

### 수강생 퀴즈 (응시·해설·진입) — PR #355
- **응시·해설·진입 라우트** (이슈 #332 / PR #355 / 브랜치 `feature/student-quiz-take#332`): `quizzes/[courseId]/[quizId]`(응시·client 섬 `QuizTakeClient`: 4지선다+5칸 페이징+제출) / `.../review`(해설·전부 Server: 총점·향상도[직전주차 대비 파랑/빨강/회색]·오답노트·전체문항) / `quizzes/page.tsx`(진입: 첫 수강강의로 redirect, 미수강 안내). 재응시 가드(응시완료→review redirect). 격리막(types/studentServer/studentActions, USE_MOCK). 동적가격 아님.

### subscriptions (구독권) + 헤더 진입 — PR #357
- **구독권 페이지** (이슈 #356 / PR #357 / 브랜치 `feature/subscription-page#356`): `app/(user)/subscriptions/page.tsx` 신규(Server) — 미구독/구독 중 2-state. `SubscriptionPlanCard`(빅카드: 혜택 5개+CTA+유의사항. 미구독=가격[수능 D-day]·지금 구독하기 / 구독 중=가격 숨김·"이미 이용 중"·구독 중 비활성) + `SubscriptionStatusCard`(구독 중 하단: 결제일/남은기간/결제금액 — 만료일은 초록 박스와 중복이라 제거). **동적 가격**: 수능일(2026-11-19)까지 남은 일수×10,000원/일(매일↓·만료=수능일), `subscriptions.mock`(SUNEUNG_DATE·priceOn·daysUntil) 계산→연동 시 BE currentPrice. **격리막**(types/server, USE_MOCK 분기+ApiSubscription 매퍼+TODO). 라우트 오타 `subcriptions`→`subscriptions` 정리. **전부 Server Component**(client 0)·아이콘 인라인 SVG(동적 5색+sparkle/퀴즈 에셋 없어 인라인). 결제 페이지는 결제 작업(16~17)으로 분리(`지금 구독하기`→`/checkout`).
- **헤더 진입** (PR #357 동봉, `UserHeader`): 네비 `퀴즈`(→`/quizzes`) + 아바타 드롭다운 `구독권`(→`/subscriptions`). ⚠️ 퀴즈 탭은 #355(진입 라우트) 머지 후 동작.

### orders / payments (강의·구독 주문/결제) — 이슈 #358
- **주문/결제 페이지** (`app/(user)/checkout/page.tsx`, Server): `?type=course|subscription` 분기. 단건=장바구니 합계(선택 결제·`CheckoutCourseClient` client 섬 + `OrderCourseList`/`OrderAmountSummary`) / 구독=FLOWN 연간 패스 1행(static). 구매자정보·결제수단은 Toss 결제창 위임이라 페이지엔 없음. 헤더 뒤로가기=공용 `BackButton`(router.back)+`arrowLeftIcon` "이전으로 돌아가기"(강사 퀴즈 페이지 형식과 통일). 격리막 `orders/{types,server}`(USE_MOCK 분기+ApiOrder 매퍼+TODO).
- **결제 흐름**: `PaymentButton`(client)→mock setTimeout→성공=토스트+`/payment-result?status=success&type=&orderNo=&amount=` / 실패=빨간 토스트+체크아웃 머묾. `payment-result/page.tsx`(Server, 성공 전용): 완료 화면+주문번호·금액+CTA(단건=내 학습/홈, 구독=강의 둘러보기/구독 확인→`/subscriptions`).
- **통합 검증**: 최신 develop(#356 구독·#355 퀴즈·dnd-kit #350) FF 후 — 구독권→결제 가격 정합(D-158·1,580,000원 일치)·헤더 퀴즈탭·`/quizzes`→`/quizzes/1`·내 코드 타입 정합 확인.
- **🔜 BE 연동 몫 (미구현 — 추후)**:
  1. **수강신청→결제 연결**: 유료 "수강신청"이 지금 결제 우회 즉시 수강(mock, `CourseDetailContent` TODO 그대로). 연동 시 ①`handleEnrollClick`에 구독 체크(무료·구독중=즉시 수강) ②유료+미구매→`/checkout?courseId=X` ③체크아웃 **단건 모드**(courseId 1개). 라이브 enroll 로직이라 BE 결제/구독 API와 함께.
  2. **구독 상태 반영**: 결제해도 mock `subscribed:false` 고정→구독권 페이지 계속 미구독으로 보임. 연동 시 BE가 subscribed 반영→구독중 화면(이미 구현된 `SubscriptionStatusCard`)으로 전환.
  3. **가격 일원화**: `orders/server.ts` inline 구독가격 계산→머지된 `subscriptions`의 `priceOn`으로 통일(현재 값 일치라 버그 아님, 중복 제거용).
- **⚡ Toss 실연동 seam**: `PaymentButton` setTimeout→Toss SDK `requestPayment(successUrl/failUrl)`, `payment-result`에 서버 승인(confirm)+로딩, 실패=failUrl→토스트. (체크아웃 "처리 중" 모달은 실제 토스창이 대신 → 제거 검토 중)
- **TEMP 게이트**: 미리보기용으로 `layout.tsx` PUBLIC_ROUTE에 checkout·payment-result·mypage·subscriptions·quizzes 임시 오픈 → **커밋 전 전부 원복**(이 커밋엔 layout.tsx 미포함).

### orders / payments (결제 내역·주문 상세·환불) — 이슈 #384 / 브랜치 `feature/payment-history#384`
- **결제 내역 목록** (`app/(user)/orders/page.tsx`, Server): 헤더 아바타 드롭다운 "결제 내역"(→`/orders`, `UserHeader` 수정). `getMyPaymentsServer`(GET /api/payment/me, 단수·MyPaymentHistoryResponse shape=amount/orderNo/displayName) → `PaymentHistoryCard`(Server·주문번호·상태뱃지·일시·금액·항목불릿, 클릭→`/orders/{orderId}`) / 빈 상태 emptyStateIcon. 격리막 `payments/{types,server}`(USE_MOCK+`toPaymentHistory`).
- **주문 상세** (`app/(user)/orders/[orderId]/page.tsx`, Server): 주문 정보(번호·상태뱃지·주문/결제일시[결제가 3분 뒤]·결제수단[신용카드/토스페이/카카오페이/계좌이체]) + `OrderRefundView`(client). ⚠️ BE 미구현(README: payment은 목록만) → **Figma 기준 가정 shape**, `getOrderDetailServer`+TODO `GET /api/order/{id}`.
- **환불 (`OrderRefundView`, client) — 항목별(per-item) 모델**:
  - 주문 내역에 **항목별 체크박스**(미환불 항목), 사유 인라인 없음. 환불된 항목=**「환불 완료」뱃지+체크박스 제거**. 구독 항목 썸네일=**체크아웃과 동일 파란 sparkle 박스**(강의=회색 이미지 placeholder, 체크아웃과 동일).
  - **환불 안내 카드**: 조건 + 환불 가능 항목(되는것만) + 예상 환불 금액 + [환불 요청하기](우측·빨강).
  - [환불 요청하기] 클릭: 불가 항목 선택 시 **「환불 불가」모달**(간단 문구, 상세 사유 X) / 가능하면 요청 모달(항목·총액·사유 필수). **부분 환불** 지원(가능한 항목만).
  - 상태별: PAID=환불 안내 / 전부환불·REFUNDED=환불 완료 카드(Figma: 완료문구+강의 접근 제한 안내) / **FAILED=환불 영역 없음**(결제실패 뱃지로 충분).
  - `refundAction`(Server Action·USE_MOCK): 선택 항목 모두 refundable이면 성공, 아니면 blocked. TODO `POST /api/payment/{id}/refund`.
- ⚡최적화 대상: 썸네일 placeholder→연동 시 `next/image`+thumbnailUrl. 부분 환불 후 항목 「환불 완료」는 client optimistic(`refundedIds`)→연동 시 BE 항목 상태 반영(상세/환불 endpoint 생기면 `Api*`타입·매퍼 조정).
- **USE_MOCK=true 유지**(결제 mock 유지 규칙 + 상세/환불 BE 미구현). TEMP 게이트(layout.tsx /orders)는 커밋 미포함.

### cart (수강생 장바구니) — 이슈 #404 / 브랜치 `feature/cart-list#404`
- **장바구니 페이지** (`app/(user)/cart/page.tsx`, Server): 프로필 드롭다운·강의 상세 "장바구니 담기"로 진입(둘 다 기존 — courses 무수정). `getCartServer`(GET /api/cart) → `CartClient`(client 섬). 컨테이너 **1080·우측 348 — 체크아웃과 폭 통일**(원래 1216/384였는데 결제로 넘어갈 때 줄어 보여서 맞춤). 이전으로(`BackButton`=router.back).
- **CartClient(client)**: 항목별·전체 선택, 선택 합계(결제 예정 금액), 개별·전체 삭제. 삭제 = `ui/confirmModal`(danger) → `ui/loadingModal`(삭제 중) → 토스트, optimistic(removedIds). 결제하기 → `/checkout?type=course`, 강의 둘러보기 → `/courses`.
- **CarItem**: 주문/결제 `OrderCourseList`와 **동일 선택 카드 디자인**(파란 틴트·체크박스 h-6·이미지 placeholder·가격 우측) + 삭제(휴지통, 토글버튼과 분리). 결제하기 버튼도 `PaymentButton`과 동일(rounded-xl·font-bold·그림자).
- **격리막**(`features/cart` types·server·actions, USE_MOCK): mock=BE shape 그대로(`cart.mock`, 수능 강의=catalog 일관, Figma의 React/Node.js는 placeholder라 미사용), 매퍼 `toCart`. `removeCartItemsAction`('use server'+revalidatePath, TODO DELETE /api/cart/{id}). cart는 BE 미구현(노션 명세).
- **재사용**(§14.1): confirmModal·loadingModal·BackButton·toast. 스캐폴드 채움(CarItem·CartSummary·CartEmptyState) + 신규(CartClient·server). `CartDeleteConfirmModal` 스캐폴드는 confirmModal 재사용으로 비워둠. (confirmModal=곽시윤 작 #6/#18, 안현이 #321에서 퀴즈 통일에 사용 — 공용 검증됨)
- ⚡최적화 대상: 썸네일 placeholder→next/image+thumbnailUrl. 삭제 optimistic→연동 시 revalidate. 결제하기는 장바구니 전체를 체크아웃에 표시(선택 부분만 넘기는 건 BE 몫). TEMP 게이트(layout.tsx /cart·/checkout·/payment-result)는 미리보기용 — 커밋 미포함.

### rankings (내 순위 + 기존 페이지 정리) — 이슈 #416 / 브랜치 `feature/ranking-myRank#416`
- **요청**: "내가 전체 중 몇 위인지" 구현. 디자인 없음 → 기존 CSS와 비슷하게 **포커스 느낌**. 범위=내 순위 + 기존 랭킹 페이지 정리(옵션 B).
- **내 순위 카드** (`MyRankingSummaryCard`, 신규·server·directive 없음): 흰 리더보드 위에서 도드라지는 **브랜드 블루 그라데이션** 강조 카드 — 트로피 SVG(aria-hidden)+"내 랭킹"+활성 탭 지표명+큰 "N위"+"전체 M명 · 상위 P%". 활성 탭 연동(순공 42위/수강 38위/채택 15위). 마이페이지 `MyRankingSummary` 타입 재사용(무영향).
- **Server-First 정리** (§0·§4): `rankings/page.tsx` `'use client'`+인라인 MOCK_DATA 제거 → **Server Component**(`Promise.all`로 보드·내랭킹 서버 조회) → 상호작용(탭 전환)만 `RankingClient`(client 섬, useState). §4.4 위반 정리: 섬 자식인 `RankingTabs`·`RankingPodium`·`RankingTable`·`RankingRow`의 **중복 `'use client'` 제거**(경계=RankingClient에만). 타입은 `types.ts`로 일원화(컴포넌트 간 export 의존 제거).
- **격리막**(`features/rankings` types·server, USE_MOCK): 인라인 mock → `rankings.mock`(`mockRankingBoard`, BE shape 가정·subtitle 포함) + `server.ts` 매퍼(`toRankingBoard`/`toRankingUser`/`toMyRanking`). 보드 endpoint BE 미구현 → 가정 shape + TODO `GET /api/rankings/{metric}`. 조회 실패는 throw(빈 데이터로 숨기지 않음 → error.tsx).
- **이름 마스킹** (§14.1 재사용): `lib/formatter.maskName`(신규·공용) — 가운데 글자 `*`(한도선→한*선, 김민→김*). **server.ts 매퍼(`toRankingUser`)에서 마스킹** → 서버(BFF)에서 가린 뒤 내려보내 브라우저엔 실명 미노출(개인정보 보호). mock name=실명 원본(BE 가정), 표시 전 매퍼가 처리. 아바타 첫 글자(`charAt(0)`)는 유지.
- ⚡최적화 대상: 아바타=첫 글자 div(이미지 없음→next/image 불필요). 보드 정렬/필터는 정적(탭만). 옛 `mockStudyTimeRanking`(미사용·닉네임 선마스킹)은 study-time 부분 명세 doc로 잔존. TEMP 게이트(layout.tsx /rankings)는 미리보기용 — 커밋 미포함.
- **PR #417 / 코드리뷰(토끼)**: 인라인 2건 모두 보류(사유 회신 + 스레드 resolve, 토끼가 둘 다 동의·철회). ① `server-only` import 추가(Minor) → 패키지 **미설치**(import 시 빌드 깨짐) + 도메인 server.ts 12개 중 0개 사용(컨벤션) → 전역 도입은 별도 작업으로 분리. ② 실 API 응답 런타임 스키마 검증(Major) → `USE_MOCK=true`라 실 분기 미실행 + 보드는 BE 미구현 가정 shape → 실제 계약 확정되는 연동 시점에 매퍼와 함께(봉투 검증 `!success||!data`은 기존).

### wishlist (찜한 강의) — 브랜치 `feature/course-wishlist` (이슈 푸시 때 생성)
- **찜한 강의 페이지** (`app/(user)/mypage/wishlist/page.tsx`, Server): 헤더 ♡/프로필 드롭다운 "찜한 강의"(→`/mypage/wishlist`, 둘 다 기존). `getWishlistServer` → `WishlistClient`(client 섬). 컨테이너 max-w-1280·반응형 grid(3~4열·gap-6). 디자인=피그마 시안(회색+책 placeholder 썸네일, 카드 286).
- **상태별 버튼** (강의 상태가 CTA 결정): 수강중→**학습하기**(`/learning/{id}` 주차별 커리큘럼) / 무료·미수강→**무료로 수강하기**(`enrollCourse(FREE)` 즉시 수강→학습하기 전환) / 유료·미담김→**장바구니 담기**(`addToCart`→토스트→"장바구니로 가기" 전환) / 유료·담김→**장바구니로 가기**(`/cart`). 공통 하단 **상세보기**(`/courses/{id}`). 썸네일 우상단 ♥→**찜 해제**(낙관적 제거+토스트 "찜한 강의에서 삭제되었습니다"). 상세페이지 버튼 패턴과 일관.
- **상세 하트 → 위시리스트 연결** (안현님 요청): `CourseDetailContent` 하트 onClick → `addWishlistAction`/`removeWishlistAction`(mockWishlist 추가·제거)로 연결 → 찜하면 위시리스트에 생기고 해제하면 사라짐. 상세 토스트 문구는 기존 유지("찜 목록에 추가/찜이 해제"), 낙관적+실패 복구.
- **격리막**(`features/wishlist` types·server·actions, USE_MOCK): mock=BE 가정 shape(찜 API 명세 없음 — 상세에 "찜 API 엔드포인트 명세에 없음" TODO), 매퍼 `toWishlistCourse`. mock 강의=catalog 수능 일관(장바구니 방침, 시안의 React/Node는 미사용 — 사용자 결정). `addToCart`·`enrollCourse`(courses/actions) 재사용(상세와 동일 액션).
- **재사용/신규**(§14.1): `addToCart`·`enrollCourse`·toast 재사용. `CourseCard`는 카드 전체가 링크라 하트·액션버튼 부재 → 전용 `WishlistCard`(아이콘 인라인 SVG: 책/카트/플레이/눈, 하트=heartFilledIcon 에셋). 신규 WishlistClient/WishlistCard/WishlistEmptyState/server/actions + wishlist.mock.
- **UI 다듬기(안현님 피드백)**: ① 썸네일=책 placeholder→**강의 이미지 방식**(`thumbnailUrl` 있으면 이미지, 없으면 과목 그라데이션) — `SUBJECT_GRADIENTS`를 CourseCard에서 export해 공용화(+`수학` 키 추가 → 강의목록의 수학 강의도 회색→파랑). ② **장바구니 담기→장바구니로 가기**: 디자인 동일(채워진 파랑)·글자만 변경(직전엔 outline로 바뀌어 어색했음). ③ 별점 `★` 글리프→공용 `StarIcon`(에셋, RatingStars). ④ 빈 상태 하트=`heartOutlineIcon`(빈 outline 하트 에셋, opacity-40) — 직전 inline filled 하트가 비대칭으로 찌그러져 교체.
- ⚡최적화 대상: 썸네일 `<img>`→연동 시 next/image+thumbnailUrl(CourseCard도 동일 — 기존 경고). 상세 `isWishlisted` 초기값=courses service가 `false` 하드코딩(찜 BE 없음)→연동 시 실제 찜 상태 동기화. **헤드리스 프리뷰는 상세 page가 BE 데이터 필요해 "불러오는 중"에서 멈춤(develop도 동일=기존 한계)** → 상세 하트 E2E는 로그인+BE 환경에서. 위시리스트 페이지는 검증 완료(담기 토스트+버튼전환·찜 해제 토스트+제거+개수·빈 상태 하트). TEMP 게이트(layout.tsx /mypage/wishlist)는 미리보기용 — 커밋 미포함.
- **PR #423 / 코드리뷰(토끼)**: 6건. **반영 4건**(commit 72a794d, 토끼 auto-resolve) — ① 상세 하트 중복클릭 가드(`wishlistPending`+disabled) ② actions `courseId` 입력검증(정수·양수, §5) ③ 찜 해제 롤백을 전체 스냅샷→해당 항목만 복구(동시 변경 보존) ④ WishlistCard `aspectRatio` 인라인→`aspect-[284/160]` 클래스. **보류 2건**(사유 회신+resolve) — ⑤ 서버측 인증(mock 단계·인증 인프라 없음, 실 인증은 BE+serverApi 쿠키/§6, 장바구니 mock 액션과 동일) ⑥ 응답 `items` shape 검증(USE_MOCK+가정 shape, 실 분기 미실행 → 연동 시점, 랭킹 #417과 동일 판단).

### notice banner (강의 페이지 공지 배너 연결) — 이슈 #425 / PR #426 / 브랜치 `fix/notice-banner#425`
- **버그**: 강의 페이지(학생/강사/관리자 공통) 상단 공지 배너 클릭해도 무동작 — 제목이 단순 `<span>`이라 링크 없음(캐러셀 화살표만 동작).
- **수정**: 배너 **전체를 클릭 영역**으로(오버레이 `<Link href="/notices" absolute inset-0>`) → 전체 공지사항 이동. 내용 `pointer-events-none`로 클릭 통과, 캐러셀 화살표/점만 `pointer-events-auto`(중첩 `<a><button>` 회피). 공유 컴포넌트 `CourseNoticeBanner` 한 곳 수정 → 3개 역할 모두 적용.
- **목적지 = `/notices`(전체 공지사항)**: 전역(고정) 공지라 전체 공지사항으로. 역할별 `/instructor/notices`·`/admin/notices`는 "강의 공지 관리"라 부적합(강의 공지는 강의 상세에서). 처음엔 역할별 `noticesHref` prop으로 했다가 안현님 피드백으로 전부 `/notices`로 통일(prop 제거).
- **코드리뷰(토끼) #426**: 2건(Minor) 반영(commit ecc96b0, auto-resolve, 미해결 0) — ① 캐러셀 버튼 `type="button"`(form submit 방지) ② 오버레이 Link `focus-visible` 링(키보드 a11y).
- 검증: 헤드리스 학생 플로우 — 배너 본문 클릭 → `/notices` 이동 ✓, 화살표 → 캐러셀만(이동 X) ✓. tsc 0·eslint 0. 찜 PR #423은 작업 중 팀원이 머지 → 이 fix는 최신 develop 기준 분리.

### community 신고 (게시글·댓글 신고) — 이슈 #432 / PR #434 / 브랜치 `feature/commu-report#432`
- **버그+기능**: 신고 깃발(게시글/댓글/대댓글)은 있었으나 `ReportModal`을 import만 하고 JSX에 안 넣어 **클릭해도 무동작**이었음 → 렌더 + 전체 흐름 연결.
- **흐름**: 깃발 🚩 → 사유 모달(BE 명세 7종·제목 가운데·체크 시 빨강) → **신고하기** → 확인 모달("해당 {게시글/댓글}을 신고 하시겠습니까?", `ui/confirmModal` 재사용) → **확인** → `submitReportAction` → "신고가 접수되었습니다" 토스트. 취소 시 사유 선택 유지.
- **대상 추적**: `CommunityDetailContent`에 `reportTarget`(POST/COMMENT + id) — 게시글→postId, 댓글/대댓글→commentId. "무엇을 신고하는지" BE 전달.
- **격리막**: `reports/actions.ts` `submitReportAction`(입력 검증 targetId 정수·양수·사유 1+, USE_MOCK 접수, `POST /api/reports` TODO — 신고자=토큰), `reports/types.ts` `ReportTargetRef`/`SubmitReportInput`/`ReportActionResult`. 확인 단계는 ReportModal 내부(showConfirm) — 사유 폼↔확인 토글, 선택 보존.
- **테스트 mock**: `community.mock` `mockPostDetailsById`(889/888/887 남의 글, 내용·작성자 일치) + services `getPostDetail`가 글별 반환(없으면 목록 항목 기준, isMine 없는 질문/자유=남의 글) → 게시글 신고 깃발 확인 가능(기존엔 항상 내 글이라 안 보였음).
- ⚡ 댓글은 현재 모든 글 공통 mock(공유) → 글별 댓글은 BE 연동 시. 신고 깃발은 남의 글/댓글만(내 것=수정/삭제). 안현님 피드백: 확인 모달은 신고하기 누른 뒤(앞 아님)·제목 가운데. TEMP 게이트(layout.tsx /community)는 미리보기용 — 커밋 미포함.
- **PR #434 / 코드리뷰(토끼)**: 1건(Minor) 보류(사유 회신+resolve, 미해결 0) — `courses/actions.ts` 주석의 `'음란'`이 ReportModal/mock의 `'음란 행위'`와 불일치 지적 → 이 PR(커뮤니티 신고) 범위 밖 파일 주석이고 강의 리뷰 신고 stub용·런타임 값은 이미 일관 → BE 사유 명세 확정 시 전역 통일.
