import { serverApi } from '@/lib/api';
import type { CourseProgress } from './types';
import { USE_MOCK } from '@/mocks/config';
import { mockCourseProgressResponse } from '@/mocks/learning.mock';

/**
 * 강의 전체 진도 — 서버 조회 (GET /api/learning/courses/{courseId}/progress).
 * 권한 없음(403)/없는 강의(404)를 화면에서 구분할 수 있도록 status도 함께 반환.
 */
export async function getCourseProgressServer(
  courseId: number,
): Promise<{ progress: CourseProgress | null; status: number }> {
  if (USE_MOCK) {
    return { progress: mockCourseProgressResponse, status: 200 };
  }
  const res = await serverApi.get<CourseProgress>(
    `/api/learning/courses/${courseId}/progress`,
  );
  return {
    progress: res.success && res.data ? res.data : null,
    status: res.httpStatus,
  };
}
