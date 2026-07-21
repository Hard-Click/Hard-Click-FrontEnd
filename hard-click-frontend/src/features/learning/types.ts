/** 영상학습/진도 도메인 타입 — 백엔드 controller/DTO 매칭 */

/* ───── 강의 영상 재생 정보 조회 (GET /api/learning/videos/{videoId}/play) ───── */
export interface VideoPlayInfo {
  videoId: number;
  courseId: number;
  /** 스트리밍 URL — presigned mp4(현행) 또는 HLS m3u8. VideoPlayer가 둘 다 처리. */
  streamingUrl: string;
  durationSeconds: number;
  lastPositionSec: number;
  watchTimeSec: number;
  completed: boolean;
}

/* ───── 영상 시청 시간 누적 (PATCH /api/learning/videos/{videoId}/progress/watch-time) ─────
 * Response: void */
export interface WatchTimeRequest {
  /** 추가로 누적할 시청 시간(초). 1 이상 */
  watchTimeSeconds: number;
}

/* ───── 마지막 재생 위치 저장 (PATCH /api/learning/videos/{videoId}/progress/position) ─────
 * Response: void */
export interface LastPositionRequest {
  /** 마지막 재생 위치(초). 0 이상 */
  positionSeconds: number;
}

/* ───── 이어보기 위치 조회 (GET /api/learning/videos/{videoId}/progress/position) ───── */
export interface PositionInfo {
  videoId: number;
  positionSeconds: number;
}

/* ───── 단일 영상 진도 조회 (GET /api/learning/videos/{videoId}/progress) ───── */
export interface VideoProgress {
  videoId: number;
  lastPositionSeconds: number;
  watchTimeSeconds: number;
  /** 영상 총 길이(초) */
  durationSeconds: number;
  /** 진도율 0~100 */
  progressRate: number;
  completed: boolean;
  /** ISO 8601 LocalDateTime — 완료 처리 시각. 미완료면 null */
  completedAt: string | null;
}

/* ───── 영상 완료 처리 (PATCH /api/learning/videos/{videoId}/progress/complete) ─────
 * Request: body 없음, Response: void */

/* ───── 강의 전체 진도 조회 (GET /api/learning/courses/{courseId}/progress) ───── */
export interface CourseProgressLesson {
  videoId: number;
  completed: boolean;
  lastPositionSeconds: number;
}

export interface CourseProgress {
  courseId: number;
  /** 0~100 (BigDecimal — 소수점 포함) */
  progressRate: number;
  completedLessonCount: number;
  totalLessonCount: number;
  lessons: CourseProgressLesson[];
}

/* ───── 사이드바/ResumeControlPanel UI 전용 ─────
 * 백엔드 CourseProgress.lessons + 강의 상세 curriculum (title/section/duration/isPreview) 머지 */
export interface SidebarVideoItem {
  videoId: number;
  title: string;
  sectionTitle: string;
  durationSeconds: number;
  completed: boolean;
  lastPositionSeconds: number;
  isPreview: boolean;
  /** CourseProgress.lessons에 존재하는 레슨인지 — false면 BE 정책상 진도율 집계 대상이 아님(예: OT). */
  tracked: boolean;
}
