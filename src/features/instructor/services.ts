import { api } from '@/services/api';

// TODO: Replace with auth store — current instructor's name
export const MOCK_CURRENT_INSTRUCTOR = '박지훈';

const USE_MOCK = true;

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

const MOCK_INSTRUCTOR_COURSES: InstructorCourseItem[] = [
  {
    courseId: 1,
    title: '수학 1 - 수열과 극한 완전 정복',
    subjectName: '수학 1',
    price: 49000,
    status: 'PUBLISHED',
    thumbnailUrl: '',
    averageRating: 4.8,
    reviewCount: 32,
    enrollmentCount: 128,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    courseId: 2,
    title: '영어 독해 고득점 전략',
    subjectName: '영어',
    price: 39000,
    status: 'PUBLISHED',
    thumbnailUrl: '',
    averageRating: 4.5,
    reviewCount: 18,
    enrollmentCount: 74,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    courseId: 3,
    title: '국어 문학 비문학 핵심 정리',
    subjectName: '국어',
    price: 0,
    status: 'DRAFT',
    thumbnailUrl: '',
    averageRating: 0,
    reviewCount: 0,
    enrollmentCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    courseId: 4,
    title: '화학 1 - 개념부터 킬러 문제까지',
    subjectName: '화학 1',
    price: 55000,
    status: 'PUBLISHED',
    thumbnailUrl: '',
    averageRating: 4.9,
    reviewCount: 45,
    enrollmentCount: 210,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    courseId: 5,
    title: '생명과학 1 완성 - 유전 집중 공략',
    subjectName: '생명과학 1',
    price: 45000,
    status: 'PUBLISHED',
    thumbnailUrl: '',
    averageRating: 4.6,
    reviewCount: 27,
    enrollmentCount: 95,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    courseId: 6,
    title: '확률과 통계 - 단기 완성',
    subjectName: '확률과 통계',
    price: 35000,
    status: 'PUBLISHED',
    thumbnailUrl: '',
    averageRating: 4.3,
    reviewCount: 12,
    enrollmentCount: 53,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

/** 강사 내 강의 목록 조회 (GET /api/instructor/courses) */
export async function getInstructorCourses(page = 0, size = 20) {
  if (USE_MOCK) {
    console.log('[MOCK] 강사 내 강의 목록');
    return {
      success: true,
      httpStatus: 200,
      data: { content: MOCK_INSTRUCTOR_COURSES, totalPages: 1 },
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
