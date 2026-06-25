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
 * (팀) 개별 도메인 플래그 — 일부 도메인은 단일 boolean으로 토글한다.
 * 공지·커뮤니티·인증처럼 별도 플래그를 쓰는 코드와의 호환을 위해 유지.
 * (FORCE_ALL_MOCK=false면 원래 값: 공지/커뮤/인증 실서버 연동)
 */
export const USE_MOCK_NOTICES = FORCE_ALL_MOCK; // 학생 공지 목록/상세 실서버 연동
export const USE_MOCK_COMMUNITY = FORCE_ALL_MOCK; // 학생 커뮤니티 실서버 연동
export const USE_MOCK_AUTH = FORCE_ALL_MOCK; // 로그인/로그아웃 등 인증 실서버 연동 (실토큰 발급 필요)

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
  reports: false, // POST /api/reports — 게시글/댓글/리뷰 신고 실서버 연동
  mypage: false, // /api/members/me(+/courses,/completed,/activities) — 마이페이지 프로필·수강·활동 실서버 연동
  grass: false, // /api/grass/{streak,study-time,lessons} — 마이페이지 잔디 실서버 연동(200·shape일치). ⚠️ /api/grass·/monthly·/yearly는 BE 500이라 yearly 모달은 mock(client services) 유지
  studyTimers: false, // stats/daily + 타이머 패널 세션 CRUD 라이브: POST /sessions(startedAt)·PATCH heartbeat(heartbeatAt)·end(endedAt)·GET current. ISO 타임스탬프(toISOString) 요구, BE가 경과시간 누적. ⚠️ pause/resume은 BE PATCH /pause가 C002(500) 버그라 라이브 미배선 → 패널 클라 사이드 유지(정지구간 누적 한계, BE 수정 시 서버 호출).
  cart: false, // /api/cart (GET·POST·DELETE/{courseId}) — 전체 CRUD 라이브 검증 완료(2026-06-24 재배포). 항목=minimal{courseId,title,instructorName,price}
  wishlist: false, // /api/wishlist (GET·POST·DELETE/{courseId}) — 전체 CRUD 라이브 검증 완료. 항목=풍부(썸네일·평점·과목·수강생수)
  rankings: false, // /api/rankings/me/summary — 마이페이지 내 랭킹 라이브(getMyRankingServer). ⚠️ 활동 시드 전엔 rank=null→"집계 전" 표시(BE 시드 후 자동 채워짐, 현재는 실값 옴). 보드(getRankingBoardServer)는 USE_MOCK 유지(3-metric 재작성 별도).
  accountDestructive: false, // PATCH /api/members/me/password · DELETE /api/members/me — 비번변경·회원탈퇴 라이브(BE 정상, 틀린비번→401 AUTH_009; api.ts가 AUTH_009는 로그인리다이렉트 제외). ⚠️ 공유 demo 계정에선 실제로 비번 변경·영구 삭제되니 데모/발표 중 주의 — 안현 결정(2026-06-25).
  quizzes: false, // 강사 퀴즈 "읽기"만 라이브(server.ts): GET /api/instructor/quizzes(목록)·/api/instructors/me/quizzes/{id}/statistics(점수통계). 섹션→주차 매핑. ⚠️ 작성/수정/삭제(actions.ts)·학생 흐름(studentServer/Actions)은 아직 USE_MOCK(전역)이라 mock — Phase 2(섹션 모델 정리 후 연동).
  subscriptions: false, // GET /api/subscriptions/me(상태)+/plan(가격) 라이브 합성 → 구독 상태/플랜. ⚠️ 가격은 BE 고정 plan.price(FE 수능 D-day 동적가격은 placeholder였음). 구독하기(POST)는 결제 흐름(mock 규칙) 경유.
  // ⚠️ 잔디 lessons/yearly/monthly는 콜드(첫호출) 200 후 연속 500 출렁(BE 작업중). members/me/profile-image=항상 500. subscriptions/me=500. quiz는 배포됨(미연동 도메인). chat=BE 없음.
  // 공지·커뮤니티·인증은 팀이 별도 플래그(USE_MOCK_NOTICES/COMMUNITY/AUTH)로 관리 → 여기서 관여하지 않음.
};

/** 도메인 단위 mock 사용 여부. 오버라이드가 없으면 전역 `USE_MOCK`을 따른다. */
export function isMock(domain: string): boolean {
  // ⚠️ 임시 전체 mock 프리뷰 — FORCE_ALL_MOCK이면 도메인 무관 mock (프리뷰 끝나면 위 토글 false)
  if (FORCE_ALL_MOCK) return true;
  // own-property만 조회 (prototype 키로 boolean 외 값이 새지 않도록)
  return Object.hasOwn(MOCK_OVERRIDE, domain) ? MOCK_OVERRIDE[domain] : USE_MOCK;
}
