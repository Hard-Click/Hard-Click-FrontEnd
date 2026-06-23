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
 * 도메인별 mock 토글 — 기능별(도메인별) 실서버 연동용.
 * 전역 USE_MOCK과 별개로, 연동 완료된 도메인만 `false`로 두면 그 도메인만 실서버를 호출한다.
 * (연동 안 된 다른 도메인은 USE_MOCK(true) 그대로 mock 유지 → 안 깨짐)
 */
export const USE_MOCK_NOTICES = false; // 학생 공지 목록/상세 실서버 연동
export const USE_MOCK_COMMUNITY = false; // 학생 커뮤니티 실서버 연동
