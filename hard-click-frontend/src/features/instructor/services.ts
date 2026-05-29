import { api } from '@/services/api';

// TODO: Replace with auth store — current instructor's name
export const MOCK_CURRENT_INSTRUCTOR = '박지훈';

const USE_MOCK = false;

/** 강사 내 강의 목록 item (노션 명세) */
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

interface InstructorCoursesApiResponse {
  content: InstructorCourseItem[];
  totalPages: number;
}

/** 강사 내 강의 목록 조회 (GET /api/instructor/courses) */
export async function getInstructorCourses(page = 0, size = 20) {
  if (USE_MOCK) {
    console.log('[MOCK] 강사 내 강의 목록');
    return {
      success: true,
      httpStatus: 200,
      data: { content: [], totalPages: 0 },
      message: '내 강의 목록 조회 완료',
    };
  }
  return api.get<InstructorCoursesApiResponse>(
    `/api/instructor/courses?page=${page}&size=${size}`,
  );
}

/**
 * 강의 등록 (POST /api/courses)
 */
export async function createCourse(payload: {
  title: string;
  subject: string;
  description: string;
  thumbnailUrl?: string;
  priceType: 'FREE' | 'PAID';
  price: number;
  sections: Array<{
    title: string;
    orderIndex: number;
    lessons: Array<{ title: string; description?: string; orderIndex: number }>;
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
    subject: string;
    description: string;
    thumbnailUrl?: string;
    priceType: 'FREE' | 'PAID';
    price: number;
    sections: Array<{
      title: string;
      orderIndex: number;
      lessons: Array<{
        title: string;
        description?: string;
        orderIndex: number;
      }>;
    }>;
  },
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

/** 썸네일 파일 업로드 (POST /api/files/upload?fileType=POST) */
export async function uploadCourseThumbnail(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch('/api/files/upload?fileType=POST', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const body = await res.json();

  return {
    ...body,
    success: res.ok && body.httpStatus < 400,
  } as {
    httpStatus: number;
    message: string;
    success: boolean;
    data?: UploadFileResponse;
  };
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
    `/api/courses/${courseId}/status?published=${published}`,
  );
}
