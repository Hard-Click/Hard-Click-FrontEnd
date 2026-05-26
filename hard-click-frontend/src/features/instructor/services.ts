import axios from 'axios';
import { api } from '@/services/api';

// TODO: Replace with auth store — current instructor's name
export const MOCK_CURRENT_INSTRUCTOR = '박지훈';

const USE_MOCK = false;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

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
 * 강의 등록 (POST /api/courses, multipart/form-data)
 * 영상 파일 업로드 포함 가능
 */
export async function createCourse(payload: {
  title: string;
  subjectId: number;
  description: string;
  price: number;
  free: '무료' | '유료';
  status?: 'DRAFT' | 'PUBLISHED';
  thumbnailUrl?: string;
  curriculum?: Array<{ title: string; durationMinutes: number }>;
  courseFile?: File;
  fileUrl?: string;
}) {
  if (USE_MOCK) {
    console.log('[MOCK] 강의 등록:', payload);
    return {
      success: true,
      httpStatus: 201,
      data: {
        courseId: 1,
        title: payload.title,
        status: payload.status ?? 'DRAFT',
        fileUrl: null,
        fileStatus: 'PENDING',
        createdAt: new Date().toISOString(),
      },
      message: '강의 등록 완료',
    };
  }

  // multipart/form-data 구성
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('subjectId', String(payload.subjectId));
  formData.append('description', payload.description);
  formData.append('price', String(payload.price));
  formData.append('free', payload.free);
  if (payload.status) formData.append('status', payload.status);
  if (payload.thumbnailUrl) formData.append('thumbnailUrl', payload.thumbnailUrl);
  if (payload.curriculum) {
    formData.append('curriculum', JSON.stringify(payload.curriculum));
  }
  if (payload.courseFile) {
    formData.append('courseFile', payload.courseFile);
  } else if (payload.fileUrl) {
    formData.append('fileUrl', payload.fileUrl);
  }

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const memberId = typeof window !== 'undefined' ? localStorage.getItem('memberId') : null;
    const response = await axios.post(`${BASE_URL}/api/courses`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(memberId ? { 'X-Member-Id': memberId } : {}),
      },
    });
    return {
      success: true,
      httpStatus: response.data?.httpStatus ?? 201,
      data: response.data?.data,
      message: response.data?.message ?? '강의 등록 완료',
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        httpStatus: error.response.status,
        data: undefined,
        message: error.response.data?.message ?? '강의 등록 실패',
      };
    }
    return {
      success: false,
      httpStatus: 500,
      data: undefined,
      message: '서버와 연결할 수 없습니다',
    };
  }
}

/**
 * 강의 수정 (PATCH /api/courses/{courseId})
 */
export async function updateCourse(
  courseId: number,
  payload: {
    title?: string;
    subjectId?: number;
    description?: string;
    price?: number;
    free?: '무료' | '유료';
    status?: 'DRAFT' | 'PUBLISHED';
    thumbnailUrl?: string;
    curriculum?: Array<{ title: string; durationMinutes: number }>;
  },
) {
  if (USE_MOCK) {
    console.log('[MOCK] 강의 수정:', courseId, payload);
    return {
      success: true,
      httpStatus: 200,
      data: { courseId, title: payload.title ?? '', updatedAt: new Date().toISOString() },
      message: '강의 수정 완료',
    };
  }
  return api.patch<{ courseId: number; title: string; updatedAt: string }>(
    `/api/courses/${courseId}`,
    payload,
  );
}

/** 강의 삭제 (DELETE /api/courses/{courseId}) */
export async function deleteCourse(courseId: number) {
  if (USE_MOCK) {
    console.log('[MOCK] 강의 삭제:', courseId);
    return { success: true, httpStatus: 200, data: null, message: '강의 삭제 완료' };
  }
  return api.delete<null>(`/api/courses/${courseId}`);
}
