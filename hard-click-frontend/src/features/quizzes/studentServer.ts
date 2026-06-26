import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
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

/* ─────────────────────────────────────────────────────────────────────────
 * 수강생 퀴즈 — 실서버 연동 (2026-06-25, Phase 2). 섹션→주차 매핑은 강사와 동일.
 * ⚠️ BE `GET /api/members/me/quizzes`엔 courseId가 없어 과목별 필터 불가 →
 *    "내 퀴즈 전체보기"로 동작(courseId 인자는 링크 라우팅용). BE에 courseId 추가되면 필터 적용.
 * ⚠️ 향상도(직전 주차 대비)는 BE가 직접 안 줘서 보류(null) — 섹션→주차 매핑이 모호해 임의 계산 안 함.
 * ───────────────────────────────────────────────────────────────────────── */

/** "섹션 N: ..." → 주차 N (server.ts와 동일 규칙). */
function sectionToWeek(s: string | null | undefined): number {
  const m = s?.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

const byWeekAsc = (a: StudentQuizItem, b: StudentQuizItem) => a.week - b.week;

/** 수강 중 강의 목록 — GET /api/members/me/courses (과목 선택용). */
export async function getEnrolledCoursesServer(): Promise<
  { courseId: number; title: string }[]
> {
  if (isMock('quizzes')) return mockEnrolledCourses;

  const res = await serverApi.get<{ courseId: number; courseTitle: string }[]>(
    '/api/members/me/courses',
  );
  if (!res.success || !res.data) return [];
  return res.data.map((c) => ({ courseId: c.courseId, title: c.courseTitle }));
}

/** GET /api/members/me/quizzes 응답 (라이브 검증 2026-06-26 — courseId 추가됨). */
interface ApiMyQuizItem {
  quizId: number;
  quizTitle: string;
  courseId: number;
  courseTitle: string;
  sectionTitle: string;
  questionCount: number;
  submitted: boolean;
  score: number;
  submittedAt: string | null;
}
interface ApiMyQuizList {
  quizzes: ApiMyQuizItem[];
  totalCount: number;
}

/**
 * 수강생 퀴즈 목록 + 본인 응시 상태 — GET /api/members/me/quizzes.
 * BE가 응답에 courseId를 제공(2026-06-26 추가)하므로 해당 강의 퀴즈만 필터한다.
 * ⚠️ 서버측 `?courseId=` 쿼리 필터는 아직 미동작(전체 반환)이라 클라에서 한 번 더 필터한다.
 *    (BE가 서버 필터를 구현하면 이 클라 필터는 무영향 — 이미 걸러진 목록을 다시 거를 뿐)
 */
export async function getStudentQuizzesServer(
  courseId: number,
): Promise<StudentQuizItem[]> {
  if (isMock('quizzes')) {
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

  const res = await serverApi.get<ApiMyQuizList>(
    `/api/members/me/quizzes?courseId=${courseId}&page=0&size=100`,
  );
  if (!res.success || !res.data) return [];
  return res.data.quizzes
    .filter((q) => q.courseId === courseId) // 해당 강의 퀴즈만(서버 필터 미동작 대비)
    .map((q) => ({
      quizId: q.quizId,
      courseId: q.courseId,
      week: sectionToWeek(q.sectionTitle),
      title: q.quizTitle,
      questionCount: q.questionCount,
      attempted: q.submitted,
      score: q.submitted ? q.score : null,
      attemptedDate: q.submittedAt ? q.submittedAt.split('T')[0] : null,
    }))
    .sort(byWeekAsc);
}

/** GET /api/quizzes/{id} 응답 (응시 — 정답·해설 미포함, 검증). */
interface ApiStudentQuizDetail {
  quizId: number;
  quizTitle: string;
  sectionTitle: string;
  submitted: boolean;
  questions: {
    questionId: number;
    questionNumber: number;
    questionText: string;
    options: { optionId: number; optionText: string }[];
  }[];
}

/**
 * 응시 화면 — 퀴즈 1개 상세(정답·해설 제외) GET /api/quizzes/{quizId}.
 * 격리막: BE가 응시 상세엔 정답을 안 줌 → 문제+보기만. 제출 시 answerIndex→optionId 변환은 studentActions에서.
 */
export async function getStudentQuizDetailServer(
  courseId: number,
  quizId: number,
): Promise<StudentQuizDetail | null> {
  if (isMock('quizzes')) {
    const quiz = mockQuizzes.find(
      (q) => q.courseId === courseId && q.quizId === quizId,
    );
    if (!quiz) return null;
    return {
      quizId: quiz.quizId,
      courseId: quiz.courseId,
      week: quiz.week,
      title: quiz.title,
      attempted: getStudentAttempt(quizId) !== null,
      questions: quiz.questions.map((q) => ({
        questionId: q.questionId,
        content: q.content,
        options: q.options,
      })),
    };
  }

  const res = await serverApi.get<ApiStudentQuizDetail>(
    `/api/quizzes/${quizId}`,
  );
  if (!res.success || !res.data) return null;
  const d = res.data;
  return {
    quizId: d.quizId,
    courseId, // 라우팅용
    week: sectionToWeek(d.sectionTitle),
    title: d.quizTitle,
    attempted: d.submitted,
    questions: d.questions.map((q) => ({
      questionId: q.questionId,
      content: q.questionText,
      options: q.options.map((o) => o.optionText), // 보기 텍스트만(optionId는 제출 시 재조회로 변환)
    })),
  };
}

/** GET /api/quizzes/{id}/reports/me 응답 (리뷰 — 정답·내답·해설 포함, 검증). */
interface ApiQuizReport {
  quizId: number;
  quizTitle: string;
  courseTitle: string;
  sectionTitle: string;
  score: number;
  totalQuestionCount: number;
  correctCount: number;
  incorrectCount: number;
  submittedAt: string;
  questions: {
    questionId: number;
    questionNumber: number;
    questionText: string;
    correctOptionId: number;
    selectedOptionId: number | null;
    correct: boolean;
    explanation: string;
    options: { optionId: number; optionText: string }[];
  }[];
}

/**
 * 리뷰(해설) 화면 — GET /api/quizzes/{quizId}/reports/me.
 * BE가 정답·내가 고른 답·해설·정답여부 다 줌 → optionId를 보기 인덱스로 변환해 UI 타입에 맞춤.
 * ⚠️ 향상도(previousScore/improvement)는 BE 미제공 → null(보류). 미응시면 BE가 에러 → null.
 */
export async function getStudentQuizReviewServer(
  courseId: number,
  quizId: number,
): Promise<StudentQuizReview | null> {
  if (isMock('quizzes')) {
    const quiz = mockQuizzes.find(
      (q) => q.courseId === courseId && q.quizId === quizId,
    );
    const sub = getQuizSubmission(quizId);
    if (!quiz || !sub) return null;
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

  const res = await serverApi.get<ApiQuizReport>(
    `/api/quizzes/${quizId}/reports/me`,
  );
  if (!res.success || !res.data) return null;
  const d = res.data;
  return {
    quizId: d.quizId,
    courseId, // 라우팅용
    week: sectionToWeek(d.sectionTitle),
    title: d.quizTitle,
    courseTitle: d.courseTitle,
    attemptedAt: d.submittedAt ? d.submittedAt.replace('T', ' ').slice(0, 16) : '',
    score: d.score,
    correctCount: d.correctCount,
    totalCount: d.totalQuestionCount,
    previousScore: null, // BE 미제공 — 향상도 보류
    improvement: null,
    questions: d.questions.map((q) => {
      const answerIndex = q.options.findIndex(
        (o) => o.optionId === q.correctOptionId,
      );
      const selectedIndex = q.options.findIndex(
        (o) => o.optionId === q.selectedOptionId,
      );
      return {
        questionId: q.questionId,
        content: q.questionText,
        options: q.options.map((o) => o.optionText),
        answerIndex,
        selectedIndex: selectedIndex >= 0 ? selectedIndex : null,
        explanation: q.explanation,
        correct: q.correct,
      };
    }),
  };
}
