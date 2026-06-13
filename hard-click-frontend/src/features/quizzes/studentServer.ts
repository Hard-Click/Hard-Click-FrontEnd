import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import {
  mockEnrolledCourses,
  getStudentAttempt,
} from '@/mocks/studentQuizzes.mock';
import type { StudentQuizItem, StudentQuizDetail } from './types';

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

/** 백엔드 응시 화면 응답(가정) — 정답 미포함(격리막). */
interface ApiStudentQuizDetail {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  questions: { questionId: number; content: string; options: string[] }[];
}

function toStudentQuizDetail(api: ApiStudentQuizDetail): StudentQuizDetail {
  return {
    quizId: api.quizId,
    courseId: api.courseId,
    week: api.week,
    title: api.title,
    questions: api.questions.map((q) => ({
      questionId: q.questionId,
      content: q.content,
      options: q.options,
    })),
  };
}

/**
 * 응시 화면 — 퀴즈 1개 상세(정답·해설 제외) 서버 조회 (Server Component 전용).
 * 격리막: 정답(answerIndex)·해설은 빼고 문제+보기만 내려준다(채점은 제출 시 서버에서).
 * API 연동 시: 엔드포인트 + ApiStudentQuizDetail/toStudentQuizDetail만 맞추면 됨.
 */
export async function getStudentQuizDetailServer(
  courseId: number,
  quizId: number,
): Promise<StudentQuizDetail | null> {
  if (USE_MOCK) {
    const quiz = mockQuizzes.find(
      (q) => q.courseId === courseId && q.quizId === quizId,
    );
    if (!quiz) return null;
    return {
      quizId: quiz.quizId,
      courseId: quiz.courseId,
      week: quiz.week,
      title: quiz.title,
      // 정답·해설 제거 — 문제/보기만 노출
      questions: quiz.questions.map((q) => ({
        questionId: q.questionId,
        content: q.content,
        options: q.options,
      })),
    };
  }

  const res = await serverApi.get<ApiStudentQuizDetail>(
    `/api/student/courses/${courseId}/quizzes/${quizId}`,
  );
  if (!res.success || !res.data) return null;
  return toStudentQuizDetail(res.data);
}
