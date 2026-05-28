/** 영상학습/진도 도메인 타입 — 노션 RestAPI 명세 매칭 */

/* ───── 강의 영상 재생 정보 조회 (GET /api/learning/videos/{videoId}/play) ───── */
export interface VideoPlayInfo {
  videoId: number;
  courseId: number;
  title: string;
  durationSeconds: number;
  playUrl: string;
  lastPositionSeconds: number;
  isCompleted: boolean;
}

/* ───── 영상 시청 시간 저장 (PATCH /api/learning/videos/{videoId}/progress/watch-time) ───── */
export interface WatchTimeRequest {
  watchedSecondsDelta: number;
  clientPlayedRangeStart?: number;
  clientPlayedRangeEnd?: number;
}

export interface WatchTimeResponse {
  videoId: number;
  watchedSeconds: number;
  progressRate: number;
}

/* ───── 강의 전체 진도 조회 (GET /api/learning/courses/{courseId}/progress) ───── */
export interface VideoProgressItem {
  videoId: number;
  title: string;
  progressRate: number;
  isCompleted: boolean;
  /** 섹션 구분용 — 백엔드 추가 시 사용 (선택) */
  sectionId?: number;
  sectionTitle?: string;
  /** 영상 길이/순서 — 백엔드 추가 시 사용 (선택) */
  durationSeconds?: number;
  orderInSection?: number;
  /** 미리보기 가능 여부 — 강의 상세 페이지에서 사용 */
  isPreview?: boolean;
}

export interface CourseProgress {
  courseId: number;
  progressRate: number;
  completedVideoCount: number;
  totalVideoCount: number;
  videos: VideoProgressItem[];
  /** mock 전용 — 강의 시청 페이지 헤더 표시용. 백엔드 명세 외 (별도 강의 상세 API로 받아야 함) */
  courseTitle?: string;
  /** mock 전용 — 강의 시청 페이지 헤더 표시용. 백엔드 명세 외 */
  instructorName?: string;
}

/* ───── 단일 영상 진도 조회 (GET /api/learning/videos/{videoId}/progress) ───── */
export interface VideoProgress {
  videoId: number;
  lastPositionSeconds: number;
  watchedSeconds: number;
  durationSeconds: number;
  progressRate: number;
  isCompleted: boolean;
}

/* ───── 영상 완료 처리 (PATCH /api/learning/videos/{videoId}/progress/complete) ───── */
export interface CompleteVideoRequest {
  watchedSeconds: number;
  durationSeconds: number;
}

export interface CompleteVideoResponse {
  videoId: number;
  isCompleted: boolean;
  completedAt: string;
}

/* ───── 마지막 재생 위치 저장 (PATCH /api/learning/videos/{videoId}/progress/position) ───── */
export interface LastPositionRequest {
  lastPositionSeconds: number;
}

export interface LastPositionResponse {
  videoId: number;
  lastPositionSeconds: number;
  savedAt: string;
}
