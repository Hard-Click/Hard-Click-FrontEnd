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
 * 수강생 퀴즈 — 실서버 연동. BE 확정 DTO(2026-07-09 재검증)에 맞춰 매퍼 정합.
 *  - 목록 GET /api/members/me/quizzes?courseId= : weekNumber·completed / courseId·courseTitle은 최상위
 *  - 상세 GET /api/quizzes/{id} : sectionTitle·submitted (→ sectionToWeek)
 *  - 리뷰 GET .../reports/me : week·previousScore(직전 실점수, 없으면 null)·scoreDiff
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

/** GET /api/members/me/quizzes 응답 (BE 확정 DTO — weekNumber·completed / courseId·courseTitle은 최상위, per-item 없음). */
interface ApiMyQuizItem {
  quizId: number;
  weekNumber: number;
  quizTitle: string;
  questionCount: number;
  completed: boolean;
  score: number | null;
  submittedAt: string | null;
}
interface ApiMyQuizList {
  courseId: number;
  courseTitle: string;
  summary: { completedCount: number; averageScore: number };
  quizzes: ApiMyQuizItem[];
}

/**
 * 수강생 퀴즈 목록 + 본인 응시 상태 — GET /api/members/me/quizzes?courseId=.
 * BE가 courseId 쿼리로 해당 강의 퀴즈만 반환(courseId·courseTitle은 응답 최상위, 항목엔 weekNumber·completed).
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
  // BE가 courseId 쿼리로 해당 강의 퀴즈만 반환(per-item courseId 없음 → 요청 courseId를 라우팅용으로 채움).
  return res.data.quizzes
    .map((q) => ({
      quizId: q.quizId,
      courseId,
      week: q.weekNumber,
      title: q.quizTitle,
      questionCount: q.questionCount,
      attempted: q.completed,
      score: q.completed ? q.score : null,
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

/** GET /api/quizzes/{id}/reports/me 응답 (BE 확정 DTO — week·previousScore·scoreDiff. courseTitle·totalQuestionCount 없음). */
interface ApiQuizReport {
  quizId: number;
  week: number;
  quizTitle: string;
  submittedAt: string;
  score: number;
  totalScore: number;
  correctCount: number;
  incorrectCount: number;
  previousScore: number | null; // 직전 주차(내 제출) 실점수. 직전 응시 없으면 null.
  scoreDiff: number; // 현재 − 직전 주차 점수. 직전 없으면 BE가 0.
  questions: {
    questionId: number;
    questionNumber: number;
    questionText: string;
    correctOptionId: number;
    selectedOptionId: number | null;
    correct: boolean;
    explanation: string;
    options: { optionId: number; optionNumber: number; optionText: string }[];
  }[];
}

/**
 * 리뷰(해설) 화면 — GET /api/quizzes/{quizId}/reports/me.
 * BE가 정답·내가 고른 답·해설·정답여부·향상도(scoreDiff) 다 줌 → optionId를 보기 인덱스로 변환해 UI 타입에 맞춤.
 * courseTitle은 BE 리포트에 없어 수강목록에서 보완. 미응시면 BE가 에러 → null.
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

  // 리포트와 수강목록(courseTitle 브레드크럼용)은 서로 독립 → 병렬 조회로 라운드트립 단축.
  const [res, courses] = await Promise.all([
    serverApi.get<ApiQuizReport>(`/api/quizzes/${quizId}/reports/me`),
    getEnrolledCoursesServer(),
  ]);
  if (!res.success || !res.data) return null;
  const d = res.data;
  const courseTitle = courses.find((c) => c.courseId === courseId)?.title ?? '';
  return {
    quizId: d.quizId,
    courseId, // 라우팅용
    week: d.week,
    title: d.quizTitle,
    courseTitle,
    attemptedAt: d.submittedAt ? d.submittedAt.replace('T', ' ').slice(0, 16) : '',
    score: d.score,
    correctCount: d.correctCount,
    totalCount: d.questions.length, // BE는 totalScore(만점)만 → 문항 수는 questions 길이
    // BE가 직전 주차 실점수(previousScore)를 직접 준다(2026-07 반영, null이면 직전 응시 없음).
    // → 예전 scoreDiff 역산의 "이전 없음 vs 동점" 모호성 해소: 동점(previousScore=score)은 improvement 0,
    //   직전 없음(null)은 비교불가(null)로 정확히 구분(동점 위조·이전없음 오표기 모두 방지, §0.1).
    previousScore: d.previousScore ?? null,
    improvement: d.previousScore != null ? d.score - d.previousScore : null,
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
