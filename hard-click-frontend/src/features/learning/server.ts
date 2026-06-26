import { serverApi } from '@/lib/api';
import type { CourseProgress } from './types';
import { isMock } from '@/mocks/config';
import { VIDEO_MOCK_MAP } from './mocks/videoMockData';

/**
 * 강의 전체 진도 — 서버 조회 (GET /api/learning/courses/{courseId}/progress).
 * 권한 없음(403)/없는 강의(404)를 화면에서 구분할 수 있도록 status도 함께 반환.
 */
export async function getCourseProgressServer(
  courseId: number,
): Promise<{ progress: CourseProgress | null; status: number }> {
  if (isMock('learning')) {
    // courseId별 동적 진도 — client getCourseProgress와 동일 소스(VIDEO_MOCK_MAP).
    // 정적 mock이 어떤 courseId에도 64.2% 고정값을 주던 §0.1-2 위반(가짜 진도가 진짜처럼) 제거.
    const lessons = Object.values(VIDEO_MOCK_MAP)
      .filter((v) => v.courseId === courseId)
      .map((v) => ({
        videoId: v.videoId,
        completed: v.isCompleted,
        lastPositionSeconds: v.lastPositionSeconds,
      }));
    const completedCount = lessons.filter((l) => l.completed).length;
    const progressRate =
      lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;
    return {
      progress: {
        courseId,
        progressRate,
        completedLessonCount: completedCount,
        totalLessonCount: lessons.length,
        lessons,
      },
      status: 200,
    };
  }
  const res = await serverApi.get<CourseProgress>(
    `/api/learning/courses/${courseId}/progress`,
  );
  return {
    progress: res.success && res.data ? res.data : null,
    status: res.httpStatus,
  };
}
