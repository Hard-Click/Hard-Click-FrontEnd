import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import { getMockQuizScoreRows } from '@/mocks/quizScores.mock';
import type { Quiz, QuizQuestion, QuizScoreBoard } from './types';

/**
 * 백엔드 퀴즈 응답(가정). 실제 명세 확정 시 이 타입 + toQuiz만 맞추면 UI는 그대로.
 * (백엔드는 보통 createdAt=ISO datetime으로 내려준다고 가정 → createdDate=YYYY-MM-DD로 변환)
 */
interface ApiQuiz {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  questionCount: number;
  createdAt: string;
  questions: QuizQuestion[];
}

/** 백엔드 응답 → UI 타입 Quiz (격리막). UI 타입으로 직접 단정하지 않는다. */
function toQuiz(api: ApiQuiz): Quiz {
  return {
    quizId: api.quizId,
    courseId: api.courseId,
    week: api.week,
    title: api.title,
    questionCount: api.questionCount,
    createdDate: api.createdAt.split('T')[0],
    questions: api.questions,
  };
}

const byWeekAsc = (a: Quiz, b: Quiz) => a.week - b.week;

/**
 * 강의별 퀴즈 목록 — 서버 조회 (Server Component 전용).
 * API 연동 시: 엔드포인트 + ApiQuiz/toQuiz만 맞추면 됨.
 */
export async function getQuizzesServer(courseId: number): Promise<Quiz[]> {
  if (USE_MOCK) {
    return mockQuizzes.filter((q) => q.courseId === courseId).sort(byWeekAsc);
  }

  const res = await serverApi.get<ApiQuiz[]>(
    `/api/instructor/courses/${courseId}/quizzes`,
  );
  if (!res.success || !res.data) return [];
  return res.data.map(toQuiz).sort(byWeekAsc); // mock과 동일 정렬 유지
}

/**
 * 강의별 "이미 퀴즈가 있는 주차" 맵 — 1주 1퀴즈 규칙용 (등록 시 중복 주차 제외).
 * { courseId: [사용된 주차들] }
 */
export async function getTakenWeeksByCourseServer(): Promise<
  Record<number, number[]>
> {
  if (USE_MOCK) {
    const map: Record<number, number[]> = {};
    for (const q of mockQuizzes) {
      (map[q.courseId] ??= []).push(q.week);
    }
    return map;
  }

  // TODO(API 연동): 강사 강의별 사용 주차 집계 (전용 엔드포인트 or 전체 퀴즈 집계)
  return {};
}

/** 백엔드 점수 응답(가정) — 격리막용. submittedAt(ISO) → submittedDate(YYYY-MM-DD). */
interface ApiQuizScoreRow {
  studentId: string;
  name: string;
  attended: boolean;
  score: number | null;
  submittedAt: string | null;
}
interface ApiQuizScoreBoard {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  rows: ApiQuizScoreRow[];
}

function toScoreBoard(api: ApiQuizScoreBoard): QuizScoreBoard {
  return {
    quizId: api.quizId,
    courseId: api.courseId,
    week: api.week,
    title: api.title,
    rows: api.rows.map((r) => ({
      studentId: r.studentId,
      name: r.name,
      attended: r.attended,
      score: r.score,
      submittedDate: r.submittedAt ? r.submittedAt.split('T')[0] : null,
    })),
  };
}

/**
 * 퀴즈 1개의 점수 현황 — 서버 조회 (Server Component 전용). 없는 퀴즈면 null.
 * API 연동 시: 엔드포인트 + ApiQuizScoreBoard/toScoreBoard만 맞추면 됨.
 */
export async function getQuizScoresServer(
  courseId: number,
  quizId: number,
): Promise<QuizScoreBoard | null> {
  if (USE_MOCK) {
    const quiz = mockQuizzes.find(
      (q) => q.quizId === quizId && q.courseId === courseId,
    );
    if (!quiz) return null;
    return {
      quizId: quiz.quizId,
      courseId: quiz.courseId,
      week: quiz.week,
      title: quiz.title,
      rows: getMockQuizScoreRows(quizId),
    };
  }

  const res = await serverApi.get<ApiQuizScoreBoard>(
    `/api/instructor/courses/${courseId}/quizzes/${quizId}/scores`,
  );
  if (!res.success || !res.data) return null;
  return toScoreBoard(res.data);
}
