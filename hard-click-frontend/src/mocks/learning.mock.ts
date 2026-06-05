/**
 * 영상학습/진도 도메인 목 데이터 — 실제 백엔드 코드(learning_activity) DTO 기준.
 * GET /api/learning/courses/{courseId}/progress → CourseProgressView
 * GET /api/learning/videos/{videoId}/play       → VideoPlayView
 *
 * ⚠️ 노션 명세와 다름(videos→lessons, playUrl→streamingUrl 등) — 실제 코드 기준으로 정렬함.
 */

/** GET /api/learning/courses/{courseId}/progress */
export interface LessonProgressItem {
  videoId: number;
  completed: boolean;
  lastPositionSeconds: number;
}

export interface CourseProgressApiResponse {
  courseId: number;
  progressRate: number; // BigDecimal → number
  completedLessonCount: number;
  totalLessonCount: number;
  lessons: LessonProgressItem[];
}

export const mockCourseProgressResponse: CourseProgressApiResponse = {
  courseId: 12,
  progressRate: 64.2,
  completedLessonCount: 9,
  totalLessonCount: 14,
  lessons: [
    { videoId: 101, completed: true, lastPositionSeconds: 1800 },
    { videoId: 102, completed: true, lastPositionSeconds: 1500 },
    { videoId: 103, completed: false, lastPositionSeconds: 320 },
  ],
};

/** GET /api/learning/videos/{videoId}/play */
export interface VideoPlayApiResponse {
  videoId: number;
  courseId: number;
  streamingUrl: string;
  durationSeconds: number;
  lastPositionSec: number;
  watchTimeSec: number;
  completed: boolean;
}

export const mockVideoPlay: VideoPlayApiResponse = {
  videoId: 101,
  courseId: 12,
  streamingUrl: 'https://cdn.example.com/videos/101.m3u8',
  durationSeconds: 1800,
  lastPositionSec: 320,
  watchTimeSec: 280,
  completed: false,
};
