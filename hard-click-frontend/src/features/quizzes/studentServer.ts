import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import {
  mockEnrolledCourses,
  getStudentAttempt,
  getQuizSubmission,
} from '@/mocks/studentQuizzes.mock';
import type {
  StudentQuizItem,
  StudentQuizDetail,
  StudentQuizReview,
  QuizReviewQuestion,
} from './types';

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

/** 백엔드 리뷰(결과) 응답(가정) — 격리막. */
interface ApiQuizReview {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  courseTitle: string;
  attemptedAt: string; // ISO
  score: number;
  correctCount: number;
  totalCount: number;
  previousScore: number | null;
  questions: {
    questionId: number;
    content: string;
    options: string[];
    answerIndex: number;
    selectedIndex: number | null;
    explanation: string;
  }[];
}

function toQuizReview(api: ApiQuizReview): StudentQuizReview {
  return {
    quizId: api.quizId,
    courseId: api.courseId,
    week: api.week,
    title: api.title,
    courseTitle: api.courseTitle,
    attemptedAt: api.attemptedAt.replace('T', ' ').slice(0, 16),
    score: api.score,
    correctCount: api.correctCount,
    totalCount: api.totalCount,
    previousScore: api.previousScore,
    improvement:
      api.previousScore !== null ? api.score - api.previousScore : null,
    questions: api.questions.map((q) => ({
      questionId: q.questionId,
      content: q.content,
      options: q.options,
      answerIndex: q.answerIndex,
      selectedIndex: q.selectedIndex,
      explanation: q.explanation,
      correct: q.selectedIndex === q.answerIndex,
    })),
  };
}

/**
 * 리뷰(해설) 화면 — 점수·향상도(직전 주차 대비)·문항별 결과 조회 (Server Component 전용).
 * 응시(제출) 기록 없으면 null(리뷰 불가). 향상도 = 같은 강의 직전 주차 점수와의 차.
 * API 연동 시: 엔드포인트 + ApiQuizReview/toQuizReview만 맞추면 됨.
 */
export async function getStudentQuizReviewServer(
  courseId: number,
  quizId: number,
): Promise<StudentQuizReview | null> {
  if (USE_MOCK) {
    const quiz = mockQuizzes.find(
      (q) => q.courseId === courseId && q.quizId === quizId,
    );
    const sub = getQuizSubmission(quizId);
    if (!quiz || !sub) return null; // 미응시면 리뷰 없음

    const questions: QuizReviewQuestion[] = quiz.questions.map((q) => {
      const sel = sub.selected[q.questionId];
      const selectedIndex = sel !== undefined ? sel : null;
      return {
        questionId: q.questionId,
        content: q.content,
        options: q.options,
        answerIndex: q.answerIndex,
        selectedIndex,
        explanation: q.explanation,
        correct: selectedIndex === q.answerIndex,
      };
    });
    const totalCount = questions.length;
    const correctCount = questions.filter((q) => q.correct).length;
    const score = totalCount
      ? Math.round((correctCount / totalCount) * 100)
      : 0;

    // 직전 주차(같은 강의) 점수 → 향상도
    const prevQuiz = mockQuizzes.find(
      (q) => q.courseId === courseId && q.week === quiz.week - 1,
    );
    const prevAttempt = prevQuiz ? getStudentAttempt(prevQuiz.quizId) : null;
    const previousScore = prevAttempt ? prevAttempt.score : null;
    const improvement = previousScore !== null ? score - previousScore : null;

    const courseTitle =
      mockEnrolledCourses.find((c) => c.courseId === courseId)?.title ?? '';

    return {
      quizId: quiz.quizId,
      courseId,
      week: quiz.week,
      title: quiz.title,
      courseTitle,
      attemptedAt: sub.attemptedAt,
      score,
      correctCount,
      totalCount,
      previousScore,
      improvement,
      questions,
    };
  }

  const res = await serverApi.get<ApiQuizReview>(
    `/api/student/courses/${courseId}/quizzes/${quizId}/result`,
  );
  if (!res.success || !res.data) return null;
  return toQuizReview(res.data);
}
