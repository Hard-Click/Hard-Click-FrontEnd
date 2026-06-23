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
 * (팀) 개별 도메인 플래그 — 일부 도메인은 단일 boolean으로 토글한다.
 * 공지처럼 별도 플래그를 쓰는 코드와의 호환을 위해 유지.
 */
export const USE_MOCK_NOTICES = false; // 학생 공지 목록/상세 실서버 연동

/**
 * 도메인별 mock 오버라이드 — 실제 백엔드 연동이 끝난 도메인만 `false`로 둔다.
 * 여기 없는 도메인은 전역 `USE_MOCK`(현재 true)을 따르므로 여전히 mock으로 동작한다.
 */
const MOCK_OVERRIDE: Record<string, boolean> = {
  // 실 BE E2E 검증이 끝나 live로 켠 도메인만 등록한다.
  courses: false, // /api/courses, /{id} — 목록/상세 실서버 연동 검증 완료
  // ⏳ 그 외(auth/users/mypage/reviews/enrollments/instructor/learning)는 격리막 코드는 준비됐으나
  //    로그인+실 BE E2E 검증 후 도메인별로 추가 → 현재는 USE_MOCK(mock) 유지.
  // 공지(notices)는 팀 #467이 별도 메커니즘(USE_MOCK_NOTICES)으로 live → 여기서 관여하지 않음.
  // payment은 팀 방침상 mock 유지 (결제내역만 BE 존재·상세/환불 미구현).
};

/** 도메인 단위 mock 사용 여부. 오버라이드가 없으면 전역 `USE_MOCK`을 따른다. */
export function isMock(domain: string): boolean {
  return MOCK_OVERRIDE[domain] ?? USE_MOCK;
}
