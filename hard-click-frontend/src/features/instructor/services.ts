import { api } from '@/services/api';
import { isMock } from '@/mocks/config';
const USE_MOCK = isMock('instructor');
import { mockInstructorCourses } from '@/mocks/instructor.mock';
import type {
  CourseListApiItem,
  CourseListApiResponse,
} from '@/features/courses/types';

// TODO: Replace with auth store — current instructor's name
export const MOCK_CURRENT_INSTRUCTOR = '박지훈';

/** 강사 화면 UI 아이템 (백엔드 CourseListItemResponse의 studentCount → enrollmentCount로 매핑) */
export interface InstructorCourseItem {
  courseId: number;
  title: string;
  subjectName: string;
  price: number;
  status: 'DRAFT' | 'PUBLISHED';
  thumbnailUrl: string;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  createdAt: string;
}

interface InstructorCoursesUiResponse {
  content: InstructorCourseItem[];
  totalPages: number;
}

/** 백엔드 CourseListItemResponse → 강사 화면 InstructorCourseItem */
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

/** 강사 내 강의 목록 조회 (GET /api/instructor/courses → CourseListResponse) */
export async function getInstructorCourses(page = 0, size = 20) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 강의 목록 조회 완료',
      data: {
        content: mockInstructorCourses.content.map(toInstructorCourseItem),
        totalPages: mockInstructorCourses.totalPages,
      } as InstructorCoursesUiResponse,
    };
  }
  const res = await api.get<CourseListApiResponse>(
    `/api/instructor/courses?page=${page}&size=${size}`
  );
  if (res.success && res.data) {
    return {
      ...res,
      data: {
        content: res.data.content.map(toInstructorCourseItem),
        totalPages: res.data.totalPages,
      } as InstructorCoursesUiResponse,
    };
  }
  return {
    ...res,
    data: { content: [] as InstructorCourseItem[], totalPages: 0 },
  };
}

/**
 * 강의 등록 (POST /api/courses)
 */
export async function createCourse(payload: {
  title: string;
  subjectId: number;
  description?: string;
  thumbnailUrl?: string;
  priceType: 'FREE' | 'PAID';
  price: number;
  learningObjectives?: string[];
  targetAudience?: string[];
  level?: string;
  sections: Array<{
    title: string;
    orderIndex: number;
    lessons: Array<{
      title: string;
      description?: string;
      orderIndex: number;
      durationSeconds?: number;
    }>;
  }>;
}) {
  if (USE_MOCK) {
    console.log('[MOCK] 강의 등록:', payload);
    return {
      success: true,
      httpStatus: 201,
      data: {
        courseId: 1,
        title: payload.title,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      },
      message: '강의 등록 완료',
    };
  }

  return api.post<{ courseId: number }>('/api/courses', payload);
}

/**
 * 강의 수정 (PATCH /api/courses/{courseId})
 */
export async function updateCourse(
  courseId: number,
  payload: {
    title: string;
    subjectId: number;
    description?: string;
    thumbnailUrl?: string;
    priceType: 'FREE' | 'PAID';
    price: number;
    learningObjectives?: string[];
    targetAudience?: string[];
    level?: string;
    sections: Array<{
      title: string;
      orderIndex: number;
      lessons: Array<{
        title: string;
        description?: string;
        orderIndex: number;
        durationSeconds?: number;
      }>;
    }>;
  }
) {
  if (USE_MOCK) {
    console.log('[MOCK] 강의 수정:', courseId, payload);
    return {
      success: true,
      httpStatus: 200,
      data: { courseId },
      message: '강의 수정 완료',
    };
  }
  return api.patch<{ courseId: number }>(`/api/courses/${courseId}`, payload);
}

/** 강의 삭제 (DELETE /api/courses/{courseId}) */
export async function deleteCourse(courseId: number) {
  if (USE_MOCK) {
    console.log('[MOCK] 강의 삭제:', courseId);
    return {
      success: true,
      httpStatus: 200,
      data: null,
      message: '강의 삭제 완료',
    };
  }
  return api.delete<null>(`/api/courses/${courseId}`);
}

interface UploadFileResponse {
  fileId: number;
  fileUrl: string;
}

interface UploadCourseThumbnailResult {
  httpStatus: number;
  message: string;
  success: boolean;
  data?: UploadFileResponse;
}

function toUploadCourseThumbnailResult(
  body: Record<string, unknown>,
  ok: boolean
): UploadCourseThumbnailResult {
  return {
    httpStatus: typeof body.httpStatus === 'number' ? body.httpStatus : (ok ? 200 : 500),
    message: typeof body.message === 'string' ? body.message : '',
    success: ok && typeof body.httpStatus === 'number' && body.httpStatus < 400,
    data: body.data as UploadFileResponse | undefined,
  };
}

/** 썸네일 파일 업로드 (POST /api/files/upload?fileType=course) */
export async function uploadCourseThumbnail(file: File): Promise<UploadCourseThumbnailResult> {
  const formData = new FormData();
  formData.append('file', file);

  // 인증은 BFF 프록시(app/api/[...path])가 쿠키→Authorization 으로 주입
  const res = await fetch('/api/files/upload?fileType=course', {
    method: 'POST',
    body: formData,
  });

  const body = await res.json();
  return toUploadCourseThumbnailResult(body, res.ok);
}

/** 강의 공개/비공개 전환 (PATCH /api/courses/{courseId}/status) */
export async function publishCourse(courseId: number, published: boolean) {
  if (USE_MOCK) {
    console.log('[MOCK] 공개/비공개:', courseId, published);
    return {
      success: true,
      httpStatus: 200,
      data: null,
      message: published ? '공개 완료' : '비공개 완료',
    };
  }
  return api.patch<null>(
    `/api/courses/${courseId}/status?published=${published}`
  );
}
