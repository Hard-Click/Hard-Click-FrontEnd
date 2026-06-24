import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { mockInstructorCourses } from '@/mocks/instructor.mock';
import type {
  CourseListApiItem,
  CourseListApiResponse,
} from '@/features/courses/types';
import type { InstructorCourseItem } from './services';

/** 백엔드 CourseListItemResponse → 강사 화면 InstructorCourseItem (studentCount→enrollmentCount) */
function toInstructorCourseItem(c: CourseListApiItem): InstructorCourseItem {
  return {
    courseId: c.courseId,
    title: c.title,
    subjectName: c.subjectName,
    price: c.price,
    status: c.status,
    thumbnailUrl: c.thumbnailUrl,
    averageRating: c.averageRating,
    reviewCount: c.reviewCount,
    enrollmentCount: c.studentCount,
    createdAt: c.createdAt,
  };
}

/** 강사 내 강의 목록 — 서버 조회 (Server Component 전용) */
export async function getInstructorCoursesServer(
  page = 0,
  size = 20,
): Promise<{ content: InstructorCourseItem[]; totalPages: number }> {
  if (isMock('instructor')) {
    return {
      content: mockInstructorCourses.content.map(toInstructorCourseItem),
      totalPages: mockInstructorCourses.totalPages,
    };
  }
  const res = await serverApi.get<CourseListApiResponse>(
    `/api/instructor/courses?page=${page}&size=${size}`,
  );
  if (res.success && res.data) {
    return {
      content: res.data.content.map(toInstructorCourseItem),
      totalPages: res.data.totalPages,
    };
  }
  return { content: [], totalPages: 0 };
}
