/**
 * 순공 세션 이탈 신호(격리막). 영상 페이지가 "이탈 시 종료"로 예약한 세션을, 전역 StudyTimerPanel이
 * "이어하기" 배너로 다시 띄우지 않게 조율한다(영상 자동종료 ↔ 전역 배너 이중관리 방지).
 *
 * ⚠️ TTL로 만료시킨다: 종료가 실패해도 신호가 그 세션을 **영영** 억제하지 않게 —
 *    TTL 지나면 다음 진입 때 배너 판단이 정상 복원된다(미아 세션을 계속 숨기지 않음).
 * ⚠️ 불변식: TTL(기본 2000ms)은 호출부의 종료 예약 지연(LearningVideoContent LESSON_SWITCH_GRACE_MS=300ms)
 *    + 서버 왕복보다 커야 배너 억제가 종료 완료 시점까지 유지된다.
 * ⚠️ 한계: **단일 탭 전용**(모듈 싱글톤은 탭/렌더링 realm마다 별개). 다른 탭의 전역 패널엔 이 억제가
 *    전달되지 않아 그 탭엔 배너가 뜰 수 있다(멀티탭 순공은 드묾 — 필요 시 BroadcastChannel로 확장).
 */
let leavingId: number | null = null;
let leavingUntil = 0;

/** 이 세션이 이탈로 곧 종료됨을 표시(id=null이면 해제). ttl 안에서만 유효(위 불변식 참고). */
export function markSessionLeaving(id: number | null, ttlMs = 2000): void {
  leavingId = id;
  leavingUntil = id == null ? 0 : Date.now() + ttlMs;
}

/** 해당 세션이 지금 이탈 종료 중(배너 억제 대상)인지. */
export function isSessionLeaving(id: number): boolean {
  return leavingId === id && Date.now() < leavingUntil;
}
