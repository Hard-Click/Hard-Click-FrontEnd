import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import {
  mockEnrolledCourses,
  getStudentAttempt,
} from '@/mocks/studentQuizzes.mock';
import type { StudentQuizItem } from './types';

const byWeekAsc = (a: StudentQuizItem, b: StudentQuizItem) => a.week - b.week;

/**
 * 수강생 수강 중 강의 목록 — 과목 선택 필터용 (Server Component 전용).
 */
export async function getEnrolledCoursesServer(): Promise<
  { courseId: number; title: string }[]
> {
  if (USE_MOCK) return mockEnrolledCourses;

  // TODO(API 연동): 수강생 수강 중 강의 목록
  const res = await serverApi.get<{ courseId: number; title: string }[]>(
    '/api/student/courses',
  );
  if (!res.success || !res.data) return [];
  return res.data;
}

/** 백엔드 수강생 퀴즈 응답(가정) — 격리막. attemptedAt(ISO) → attemptedDate(YYYY-MM-DD). */
interface ApiStudentQuiz {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  questionCount: number;
  attempted: boolean;
  score: number | null;
  attemptedAt: string | null;
}

function toStudentQuizItem(api: ApiStudentQuiz): StudentQuizItem {
  return {
    quizId: api.quizId,
    courseId: api.courseId,
    week: api.week,
    title: api.title,
    questionCount: api.questionCount,
    attempted: api.attempted,
    score: api.score,
    attemptedDate: api.attemptedAt ? api.attemptedAt.split('T')[0] : null,
  };
}

/**
 * 수강생 강의별 퀴즈 목록 + 본인 응시 상태 — 서버 조회 (Server Component 전용).
 * 퀴즈는 강사 등록분(quizzes.mock) 재사용 + 응시 기록 결합.
 * API 연동 시: 엔드포인트 + ApiStudentQuiz/toStudentQuizItem만 맞추면 됨.
 */
export async function getStudentQuizzesServer(
  courseId: number,
): Promise<StudentQuizItem[]> {
  if (USE_MOCK) {
    return mockQuizzes
      .filter((q) => q.courseId === courseId)
      .map((q) => {
        const attempt = getStudentAttempt(q.quizId);
        return {
          quizId: q.quizId,
          courseId: q.courseId,
          week: q.week,
          title: q.title,
          questionCount: q.questionCount,
          attempted: attempt !== null,
          score: attempt?.score ?? null,
          attemptedDate: attempt?.attemptedDate ?? null,
        };
      })
      .sort(byWeekAsc);
  }

  const res = await serverApi.get<ApiStudentQuiz[]>(
    `/api/student/courses/${courseId}/quizzes`,
  );
  if (!res.success || !res.data) return [];
  return res.data.map(toStudentQuizItem).sort(byWeekAsc);
}
