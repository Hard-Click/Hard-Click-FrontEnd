/**
 * 영상학습/진도 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/learning/courses/{courseId}/progress
 * GET /api/learning/videos/{videoId}/play
 */

export interface VideoProgressApiItem {
  videoId: number;
  title: string;
  progressRate: number; // 0~100
  isCompleted: boolean;
}

export interface CourseProgressApiResponse {
  courseId: number;
  progressRate: number;
  completedVideoCount: number;
  totalVideoCount: number;
  videos: VideoProgressApiItem[];
}

export const mockCourseProgressResponse: CourseProgressApiResponse = {
  courseId: 12,
  progressRate: 64.2,
  completedVideoCount: 9,
  totalVideoCount: 14,
  videos: [
    { videoId: 101, title: '1강. 스프링 입문', progressRate: 100, isCompleted: true },
    { videoId: 102, title: '2강. 의존성 주입', progressRate: 100, isCompleted: true },
    { videoId: 103, title: '3강. 빈 스코프', progressRate: 40, isCompleted: false },
  ],
};

export interface VideoPlayApiResponse {
  videoId: number;
  courseId: number;
  title: string;
  durationSeconds: number;
  playUrl: string;
  lastPositionSeconds: number;
  isCompleted: boolean;
}

export const mockVideoPlay: VideoPlayApiResponse = {
  videoId: 101,
  courseId: 12,
  title: '1강. 스프링 입문',
  durationSeconds: 1800,
  playUrl: 'https://cdn.example.com/videos/101.m3u8',
  lastPositionSeconds: 320,
  isCompleted: false,
};
