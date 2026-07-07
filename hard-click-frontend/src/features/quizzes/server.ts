import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import { getMockQuizScoreRows } from '@/mocks/quizScores.mock';
import type { Quiz, QuizScoreBoard } from './types';
import type { AdminCourseManageRow } from '@/mocks/admin.mock';

/* ─────────────────────────────────────────────────────────────────────────
 * 퀴즈 도메인 — 강사 읽기(목록·점수통계) 실서버 연동 (2026-06-25, 라이브 검증 완료).
 * ⚠️ BE는 퀴즈를 "섹션(section)" 기반으로 관리 → FE의 "주차(week)"는 sectionTitle("섹션 N: ...")의
 *    숫자를 파싱해 매핑(사용자 결정: 섹션을 주차처럼). 섹션명과 주차가 안 맞을 수 있음(허용).
 * ⚠️ 작성/수정/삭제(actions.ts)·학생 흐름(studentServer/Actions)은 아직 USE_MOCK(mock) — Phase 2.
 * ───────────────────────────────────────────────────────────────────────── */

/** GET /api/instructor/quizzes?courseId= 응답 (라이브 검증). */
interface ApiInstructorQuizItem {
  quizId: number;
  quizTitle: string;
  courseTitle: string;
  sectionTitle: string;
  questionCount: number;
  createdAt: string;
}
interface ApiInstructorQuizList {
  courseId: number;
  sectionId: number | null;
  quizzes: ApiInstructorQuizItem[];
}

/** "섹션 N: ..." 제목 → 주차 번호. 숫자 없으면 0. (섹션→주차 매핑) */
function sectionToWeek(sectionTitle: string | null | undefined): number {
  const m = sectionTitle?.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

const byWeekAsc = (a: Quiz, b: Quiz) => a.week - b.week;

/**
 * 강의별 퀴즈 목록 — 서버 조회 (Server Component 전용).
 * 라이브: GET /api/instructor/quizzes?courseId= → 섹션→주차 매핑. 목록엔 문항 없음(상세에서).
 */
export async function getQuizzesServer(courseId: number): Promise<Quiz[]> {
  if (isMock('quizzes')) {
    return mockQuizzes.filter((q) => q.courseId === courseId).sort(byWeekAsc);
  }

  const res = await serverApi.get<ApiInstructorQuizList>(
    `/api/instructor/quizzes?courseId=${courseId}`,
  );
  if (!res.success || !res.data) return [];
  const cid = res.data.courseId ?? courseId;
  return res.data.quizzes
    .map((item) => ({
      quizId: item.quizId,
      courseId: cid,
      week: sectionToWeek(item.sectionTitle),
      title: item.quizTitle,
      questionCount: item.questionCount,
      createdDate: item.createdAt ? item.createdAt.split('T')[0] : '',
      questions: [], // 목록 응답엔 문항 미포함 — 상세(GET /api/instructor/quizzes/{id})에서 조회
    }))
    .sort(byWeekAsc);
}

/**
 * 강의별 "이미 퀴즈가 있는 주차" 맵 — 1주 1퀴즈 규칙용(등록 폼).
 * ⚠️ 등록 폼(actions.ts)은 아직 mock이라 이 값도 mock 사용. 라이브 분기는 BE가 courseId별 집계
 *    엔드포인트가 없어(목록 item에 courseId 없음) 비워둠 → Phase 2(등록 연동)에서 강의별 집계.
 */
export async function getTakenWeeksByCourseServer(): Promise<
  Record<number, number[]>
> {
  if (isMock('quizzes')) {
    const map: Record<number, number[]> = {};
    for (const q of mockQuizzes) {
      (map[q.courseId] ??= []).push(q.week);
    }
    return map;
  }
  // TODO(Phase 2): 등록 연동 시 강의별 사용 주차 집계 (courseId별 GET /api/instructor/quizzes 호출)
  return {};
}

/** GET /api/instructors/me/quizzes/{quizId}/statistics 응답 (라이브 검증). */
interface ApiQuizStudentScore {
  userId: string;
  name: string;
  submitted: boolean;
  score: number;
  submittedAt: string | null;
}
interface ApiQuizStatistics {
  courseTitle: string;
  sectionTitle: string;
  quizTitle: string;
  summary: {
    submittedCount: number;
    notSubmittedCount: number;
    averageScore: number;
  };
  scoreDistribution: { range: string; count: number; percentage: number }[];
  students: ApiQuizStudentScore[];
}

/**
 * 퀴즈 1개 점수 현황 — 서버 조회 (Server Component 전용). 없는 퀴즈면 null.
 * 라이브: GET /api/instructors/me/quizzes/{quizId}/statistics. (courseId는 URL에 없어 인자로 받아 채움)
 * summary/분포는 FE가 rows로 재집계(scoreboard.ts)하므로 students(rows)만 매핑.
 */
export async function getQuizScoresServer(
  courseId: number,
  quizId: number,
): Promise<QuizScoreBoard | null> {
  if (isMock('quizzes')) {
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

  const res = await serverApi.get<ApiQuizStatistics>(
    `/api/instructors/me/quizzes/${quizId}/statistics`,
  );
  if (!res.success || !res.data) return null;
  return {
    quizId,
    courseId,
    week: sectionToWeek(res.data.sectionTitle),
    title: res.data.quizTitle,
    rows: res.data.students.map((s) => ({
      studentId: s.userId,
      name: s.name,
      attended: s.submitted,
      score: s.submitted ? s.score : null,
      submittedDate: s.submittedAt ? s.submittedAt.split('T')[0] : null,
    })),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * 관리자 전용 퀴즈 조회 — GET /api/admin/quizzes/*
 * ───────────────────────────────────────────────────────────────────────── */

/** GET /api/admin/quizzes/courses 응답 (라이브 검증 2026-07-07).
 * ⚠️ BE 필드명: title→courseTitle, status→visible(boolean), createdAt→registeredAt.
 *    과목(subjectName)·평점·가격은 이 엔드포인트에 미제공 → 빈 값/기본값. */
interface ApiAdminQuizCourseItem {
  courseId: number;
  courseTitle: string;
  instructorName?: string;
  subjectName?: string;
  studentCount?: number;
  averageRating?: number;
  reviewCount?: number;
  price?: number;
  priceType?: string;
  visible?: boolean;
  registeredAt?: string;
}
interface ApiAdminQuizCoursesResponse {
  courses: ApiAdminQuizCourseItem[];
  totalPages?: number;
}

/** 관리자 퀴즈 관리용 강의 목록 (GET /api/admin/quizzes/courses). */
export async function getAdminQuizCoursesServer(): Promise<AdminCourseManageRow[]> {
  if (isMock('quizzes')) {
    return [];
  }
  const res = await serverApi.get<ApiAdminQuizCoursesResponse>('/api/admin/quizzes/courses');
  if (!res.success || !Array.isArray(res.data?.courses)) return [];
  return res.data.courses.map((c) => ({
    id: c.courseId,
    title: c.courseTitle,
    subject: c.subjectName ?? '',
    instructor: c.instructorName ?? '',
    studentCount: c.studentCount ?? 0,
    rating: c.averageRating ?? 0,
    reviewCount: c.reviewCount ?? 0,
    price: c.price ?? 0,
    isFree: c.priceType === 'FREE',
    status: c.visible ? 'PUBLISHED' : 'HIDDEN',
    createdAt: c.registeredAt?.split('T')[0] ?? '',
  }));
}

/** GET /api/admin/quizzes/courses/{courseId} 응답 */
interface ApiAdminQuizList {
  courseId: number;
  weeks: ApiInstructorQuizItem[];
}

/** 관리자 — 강의별 주차 퀴즈 목록 (GET /api/admin/quizzes/courses/{courseId}). */
export async function getAdminCourseQuizzesServer(courseId: number): Promise<Quiz[]> {
  if (isMock('quizzes')) {
    return mockQuizzes.filter((q) => q.courseId === courseId).sort(byWeekAsc);
  }
  const res = await serverApi.get<ApiAdminQuizList>(
    `/api/admin/quizzes/courses/${courseId}`,
  );
  if (!res.success || !res.data || !Array.isArray(res.data.weeks)) return [];
  const cid = res.data.courseId ?? courseId;
  return res.data.weeks
    .map((item) => ({
      quizId: item.quizId,
      courseId: cid,
      week: sectionToWeek(item.sectionTitle),
      title: item.quizTitle,
      questionCount: item.questionCount,
      createdDate: item.createdAt ? item.createdAt.split('T')[0] : '',
      questions: [],
    }))
    .sort(byWeekAsc);
}

/** 관리자 — 퀴즈 점수 현황 (GET /api/admin/quizzes/{quizId}/statistics). */
export async function getAdminQuizScoresServer(
  courseId: number,
  quizId: number,
): Promise<QuizScoreBoard | null> {
  if (isMock('quizzes')) {
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
  const res = await serverApi.get<ApiQuizStatistics>(
    `/api/admin/quizzes/${quizId}/statistics`,
  );
  if (!res.success || !res.data) return null;
  return {
    quizId,
    courseId,
    week: sectionToWeek(res.data.sectionTitle),
    title: res.data.quizTitle,
    rows: res.data.students.map((s) => ({
      studentId: s.userId,
      name: s.name,
      attended: s.submitted,
      score: s.submitted ? s.score : null,
      submittedDate: s.submittedAt ? s.submittedAt.split('T')[0] : null,
    })),
  };
}
