/**
 * 목 데이터 사용 여부 토글.
 *
 * - 백엔드 연동 전: `true` 로 두고 `src/mocks/*.mock.ts` 데이터로 개발.
 * - 백엔드 연동 시: `false`(기본) → 실제 API 호출.
 *
 * 목 데이터는 백엔드 응답 명세(shape) 그대로라, 이 값만 바꿔도 매핑 코드가 동일하게 동작한다.
 */
export const USE_MOCK = true;

/**
 * ⚠️ 임시 전체 mock 프리뷰 토글.
 * `true` → 모든 도메인 + 공지/커뮤/인증을 **mock 강제**(라이브 설정 무시, BE 없이 화면 확인).
 * 프리뷰 끝나면 이 값만 `false`로 되돌리면 라이브 설정(MOCK_OVERRIDE·아래 플래그) 그대로 복원.
 */
const FORCE_ALL_MOCK: boolean = false;

/**
 * E2E mock 전용 플래그 — `test:e2e:mock` 실행 시 webServer가 `NEXT_PUBLIC_E2E_MOCK=1`을 세팅한다.
 * 켜지면 모든 도메인+인증을 mock 강제(BE 없이 결정적 E2E). 평소/프로덕션엔 미설정이라 영향 0.
 */
const E2E_MOCK = process.env.NEXT_PUBLIC_E2E_MOCK === '1';

/**
 * (팀) 개별 도메인 플래그 — 일부 도메인은 단일 boolean으로 토글한다.
 * 공지·커뮤니티·인증처럼 별도 플래그를 쓰는 코드와의 호환을 위해 유지.
 * (FORCE_ALL_MOCK=false면 원래 값: 공지/커뮤/인증 실서버 연동)
 */
export const USE_MOCK_NOTICES = FORCE_ALL_MOCK || E2E_MOCK; // 학생 공지 목록/상세 실서버 연동
export const USE_MOCK_COMMUNITY = FORCE_ALL_MOCK || E2E_MOCK; // 학생 커뮤니티 실서버 연동
export const USE_MOCK_AUTH = FORCE_ALL_MOCK || E2E_MOCK; // 로그인/로그아웃 등 인증 실서버 연동 (실토큰 발급 필요)

/**
 * 도메인별 mock 오버라이드 — 실제 백엔드 연동이 끝난 도메인만 `false`로 둔다.
 * 여기 없는 도메인은 전역 `USE_MOCK`(현재 true)을 따르므로 여전히 mock으로 동작한다.
 */
const MOCK_OVERRIDE: Record<string, boolean> = {
  // 실 BE E2E 검증이 끝나 live로 켠 도메인만 등록한다.
  courses: false, // /api/courses, /{id} — 목록/상세 실서버 연동 검증 완료
  instructor: false, // 강사 강의 등록/수정/삭제/공개비공개 실서버 연동
  reviews: false, // /api/courses/{id}/reviews — 목록/작성/수정/삭제 실서버 연동
  enrollments: false, // POST /api/enrollments, GET /api/enrollments/me — 수강신청 실서버 연동
  payments: false, // POST /api/payments/confirm — 토스 결제 승인 실서버 연동(Client Key 필요)
  orders: false, // GET /api/order/checkout?type=&courseId= — 단건/장바구니/구독 주문 조회(실 orderNo 발급). 이 orderNo가 토스 orderId→confirm 검증에 쓰임. 이전엔 FE가 orderNo 조작→confirm C001 실패였음.
  reports: false, // POST /api/reports — 게시글/댓글/리뷰 신고 실서버 연동
  mypage: false, // /api/members/me(+/courses,/completed,/activities) — 마이페이지 프로필·수강·활동 실서버 연동
  grass: false, // /api/grass/{streak,study-time,lessons,days} — 마이페이지 잔디 실서버 연동(200·shape일치). 연간 모달(client services.ts)도 라이브 전환 완료(2026-06-25 재검증: study-time/lessons?year= 200·365일, 이전 500은 해소됨).
  studyTimers: false, // stats/daily(마이페이지) + 타이머 패널/학습영상 세션 CRUD 라이브: POST /sessions(startedAt)·PATCH heartbeat(heartbeatAt)·end(endedAt)·pause(pausedAt)·resume(resumedAt)·GET current. ISO 타임스탬프(toISOString)·BE 경과시간 누적·heartbeat/pause/resume 응답으로 로컬 보정. ✅ pause/resume 라이브 배선 완료(라이브 검증 2026-07-11: 200, 이전 C002/500 BE버그 해소) → BE가 정지구간을 누적에서 제외.
  cart: false, // /api/cart (GET·POST·DELETE/{courseId}) — 전체 CRUD 라이브 검증 완료(2026-06-24 재배포). 항목=minimal{courseId,title,instructorName,price}
  wishlist: false, // /api/wishlist (GET·POST·DELETE/{courseId}) — 전체 CRUD 라이브 검증 완료. 항목=풍부(썸네일·평점·과목·수강생수)
  rankings: false, // /api/rankings/me/summary(내 랭킹) + 보드 3지표(study-time/lessons/accepted-comments?period=daily|weekly|monthly) 라이브. ⚠️ 보드는 BE가 이름 안 줘서(memberId만) "나"/"학습자" 익명화(BE 닉네임 추가 시 자동개선). 활동 시드 전엔 rank=null→0위.
  accountDestructive: false, // PATCH /api/members/me/password · DELETE /api/members/me — 비번변경·회원탈퇴 라이브(BE 정상, 틀린비번→401 AUTH_009; api.ts가 AUTH_009는 로그인리다이렉트 제외). ⚠️ 공유 demo 계정에선 실제로 비번 변경·영구 삭제되니 데모/발표 중 주의 — 안현 결정(2026-06-25).
  quizzes: false, // 강사 읽기(server.ts: 목록·점수통계)·학생 흐름(studentServer/studentActions: 목록·응시·리뷰 reports/me·제출)·강사 쓰기(actions.ts 등록/수정/삭제) 전부 라이브(연동). 섹션→주차 매핑. 강사 쓰기 = BE 실구현(QuizCommandService 소유권검증+실 JPA 영속 저장, develop·main 확인, stub 아님) — 매퍼가 BE InstructorQuizRequest 공통 필드 일치(sectionId←주차 orderIndex·correctOptionNumber←answerIndex+1·optionText). ⚠️ difficulty(1~3 @NotNull)·소프트삭제(deleted_at)는 develop 전용 — main은 difficulty 필드 없음(무시)·삭제 hard-delete.
  subscriptions: false, // GET /api/subscriptions/me(상태)+/plan(가격) 라이브 합성 → 구독 상태/플랜. ⚠️ 가격은 BE 고정 plan.price(FE 수능 D-day 동적가격은 placeholder였음). 구독하기(POST)는 결제 흐름(mock 규칙) 경유.
  notifications: false, // 헤더 종 알림 — GET /api/notifications(목록,data={content,hasNext})·/unread-count(미읽음수)·PATCH /api/notifications/{id}/read(읽음). 루트 layout에서 서버조회→NotificationProvider(AuthProvider 패턴 미러). 라이브 검증(2026-06-25). SSE 실시간(/api/notifications/stream→BE /subscribe)도 라이브(NotificationProvider SSE_ENABLED=true·EventSource 구독). 읽음=Provider 낙관적 갱신.
  learning: false, // 영상 재생/진도(/api/learning/*) — 라이브 전환(2026-06-27). BE가 영상 시드+lesson↔video 매핑 제공: courses/{id}/progress가 lessons[videoId] 줌, videos/{id}/play가 실 S3 streamingUrl(presigned) 줌. shape 라이브 검증 완료(play·progress·position·course progress 전부 FE 타입 일치). ⚠️ 영상 데이터는 일부만 연결(videoId 1=200, 나머지 404 L005=BE가 더 업로드해야) → 미연결은 VideoErrorState로 처리.
  chat: false, // 채팅 — GET /api/chat/rooms/{me,/{id},/{id}/messages} + STOMP(/ws-chat). 라이브 검증 완료(2026-07-10 세션: REST 200·socket-ticket 201·송수신 라운드트립, 로컬 http 기준). ⚠️ 실시간은 prod가 BE를 wss로 노출해야 동작(평문 ws://면 https에서 혼합콘텐츠 차단 → useChatSocket 가드가 비활성). REST는 BFF라 prod도 정상.
  // ⚠️ 잔디 lessons/yearly/monthly는 콜드(첫호출) 200 후 연속 500 출렁(BE 작업중). members/me/profile-image=항상 500. subscriptions/me=500.
  // 공지·커뮤니티·인증은 팀이 별도 플래그(USE_MOCK_NOTICES/COMMUNITY/AUTH)로 관리 → 여기서 관여하지 않음.
};

/** 도메인 단위 mock 사용 여부. 오버라이드가 없으면 전역 `USE_MOCK`을 따른다. */
export function isMock(domain: string): boolean {
  // E2E mock 실행(NEXT_PUBLIC_E2E_MOCK=1) 또는 전체 mock 프리뷰면 도메인 무관 mock
  if (E2E_MOCK || FORCE_ALL_MOCK) return true;
  // own-property만 조회 (prototype 키로 boolean 외 값이 새지 않도록)
  return Object.hasOwn(MOCK_OVERRIDE, domain) ? MOCK_OVERRIDE[domain] : USE_MOCK;
}
