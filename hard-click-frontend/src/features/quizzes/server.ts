import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import { getMockQuizScoreRows } from '@/mocks/quizScores.mock';
import type { Quiz, QuizScoreBoard } from './types';
import type { AdminCourseManageRow } from '@/mocks/admin.mock';

/* ─────────────────────────────────────────────────────────────────────────
 * 퀴즈 도메인 — 강사 읽기(목록·점수통계) 실서버 연동 (2026-06-25, 라이브 검증 완료).
 * ⚠️ BE는 퀴즈를 "섹션(section)" 기반으로 관리. FE의 "주차(week)"는 목록·통계 응답의 weekNumber(섹션
 *    orderIndex 기반, BE 제공)를 쓴다. 통계(InstructorQuizStatistics)는 2026-07-13 BE가 weekNumber를
 *    추가해 목록과 정합됨(제목파싱 폐기). 상세(InstructorQuizDetail)만 아직 weekNumber를 안 줘(sectionTitle만)
 *    sectionToWeek 제목파싱으로 폴백한다 — 섹션 제목 숫자가 orderIndex와 어긋나면(자유텍스트·삭제 섹션)
 *    목록/통계 주차 ↔ 상세 breadcrumb 주차가 불일치할 수 있다. → BE에 상세 응답 weekNumber 추가 요청 남음.
 * ⚠️ 작성/수정/삭제(actions.ts)·학생 흐름(studentServer/Actions)도 라이브(isMock('quizzes')=false).
 *    BE 강사/관리자 쓰기(QuizController·AdminQuizController)도 실구현됨(2026-07 develop) — mock 아님.
 * ───────────────────────────────────────────────────────────────────────── */

/** GET /api/instructor/quizzes?courseId= 응답 (라이브 검증). 목록엔 BE가 weekNumber(섹션 orderIndex 기반)를 직접 준다. */
interface ApiInstructorQuizItem {
  quizId: number;
  quizTitle: string;
  courseTitle: string;
  weekNumber: number; // 섹션 orderIndex 기반 주차(BE 제공) — 제목 정규식 파싱 대체(자유텍스트·삭제섹션에 강건)
  sectionTitle: string;
  questionCount: number;
  createdAt: string;
}
interface ApiInstructorQuizList {
  courseId: number;
  sectionId: number | null;
  quizzes: ApiInstructorQuizItem[];
}

/** 섹션 제목의 앞 숫자 → 주차 번호 (예 "1단원. 함수"→1, "3주차 …"→3). 숫자 없으면 0.
 *  퀴즈는 번호 있는 커리큘럼 주차에만 출제 → 오리엔테이션 등 무번호 섹션은 0(=퀴즈 대상 아님)으로 걸러진다. */
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
      week: item.weekNumber,
      title: item.quizTitle,
      questionCount: item.questionCount,
      createdDate: item.createdAt ? item.createdAt.split('T')[0] : '',
      questions: [], // 목록 응답엔 문항 미포함 — 상세(GET /api/instructor/quizzes/{id})에서 조회
    }))
    .sort(byWeekAsc);
}

/**
 * 강의별 "이미 퀴즈가 있는 주차" 맵 — 1주 1퀴즈 규칙용(등록 폼).
 * ℹ️ 등록/수정(actions.ts)은 이미 라이브다. 이 페이지 레벨 헬퍼의 라이브 분기는 BE가 courseId별 집계
 *    엔드포인트가 없어(목록 item에 courseId 없음) 의도적으로 {} 반환 — 실제 1주1퀴즈 점유 주차는
 *    등록 폼(QuizFormModal)이 강의 선택 시 getQuizFormMetaServer(라이브 getQuizzesServer 집계)로 별도 계산한다.
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
  // 강의별 집계 엔드포인트가 없어 라이브 분기는 {}. 실제 점유 주차는 등록 폼의 getQuizFormMetaServer가 강의 선택 시 라이브 계산.
  return {};
}

/** GET /api/courses/{courseId} → 섹션 목록 {sectionId, week}. 등록/수정 시 "주차 → 진짜 sectionId" 해석용.
 *  ⚠️ week = 섹션 orderIndex(BE 제공)를 쓴다 — 퀴즈 목록의 weekNumber(=weekOf=orderIndex)와 동일 스킴이라야
 *     getQuizFormMetaServer의 weeks(섹션)↔takenWeeks(퀴즈) 비교가 정합(1주1퀴즈 중복체크). 제목 정규식(sectionToWeek)은
 *     제목 숫자↔orderIndex가 어긋나면 두 스킴이 달라져 중복체크가 깨진다. */
export async function getCourseSectionsServer(
  courseId: number,
): Promise<{ sectionId: number; week: number }[]> {
  const res = await serverApi.get<{
    sections?: { sectionId: number; orderIndex: number }[];
  }>(`/api/courses/${courseId}`);
  if (!res.success || !Array.isArray(res.data?.sections)) return [];
  return res.data.sections.map((s) => ({
    sectionId: s.sectionId,
    week: s.orderIndex,
  }));
}

/** ① 강사 퀴즈 상세(문항 포함) — 수정 모달용. GET /api/instructor/quizzes/{quizId}.
 *  목록 응답엔 questions가 없어(questions:[]), 수정 시 이걸 불러 실제 문항을 채운다.
 *  정답 인덱스 = options[].correct 플래그(없으면 correctOptionId 매칭 폴백). */
interface ApiInstructorQuizDetail {
  quizId: number;
  quizTitle: string;
  courseId: number;
  sectionTitle: string;
  createdAt: string;
  questions: {
    questionId: number;
    questionText: string;
    explanation: string | null;
    difficulty: number | null; // 난이도 1=하/2=중/3=상 (BE 제공, 기존 문항은 null 가능)
    correctOptionId: number;
    options: { optionId: number; optionText: string; correct: boolean }[];
  }[];
}
/** 퀴즈 상세 응답 → Quiz(문항 포함) 매퍼. 정답 인덱스는 options[].correct 우선, 없으면 correctOptionId 매칭.
 *  강사/관리자 상세가 동일 shape라 공유. */
function toQuizDetail(d: ApiInstructorQuizDetail): Quiz {
  return {
    quizId: d.quizId,
    courseId: d.courseId,
    week: sectionToWeek(d.sectionTitle),
    title: d.quizTitle,
    questionCount: d.questions.length,
    createdDate: d.createdAt ? d.createdAt.split('T')[0] : '',
    questions: d.questions.map((q) => {
      const byFlag = q.options.findIndex((o) => o.correct);
      // 정상 응답은 correct=true 옵션 1개라 byFlag>=0. 둘 다 실패 시 -1(정답 미선택으로 열림,
      // 저장 시 재선택 필요) — 빈 상태 degrade지 조용한 위조 아님. 정상 시드에선 도달 안 함.
      return {
        questionId: q.questionId,
        content: q.questionText,
        options: q.options.map((o) => o.optionText),
        answerIndex:
          byFlag >= 0
            ? byFlag
            : q.options.findIndex((o) => o.optionId === q.correctOptionId),
        explanation: q.explanation ?? '',
        // 난이도 도입(V3.5.1) 이전 문항은 BE가 difficulty=null → 수정 진입 시 '중'(2)으로 기본 선택해
        //   문항마다 다시 고르는 수고를 던다(BE @NotNull이라 값은 필요). 편집 폼에서 사용자가 보고 바꿀 수 있음.
        difficulty: q.difficulty ?? 2,
      };
    }),
  };
}

/** 강사 퀴즈 상세(수정 진입 문항 로드) — GET /api/instructor/quizzes/{id}. */
export async function getInstructorQuizDetailServer(
  quizId: number,
): Promise<Quiz | null> {
  if (isMock('quizzes')) {
    return mockQuizzes.find((q) => q.quizId === quizId) ?? null;
  }
  const res = await serverApi.get<ApiInstructorQuizDetail>(
    `/api/instructor/quizzes/${quizId}`,
  );
  if (!res.success || !res.data) return null;
  return toQuizDetail(res.data);
}

/** 관리자 퀴즈 상세 — GET /api/admin/quizzes/{id}. 관리자 수정 흐름이 강사 엔드포인트로 새지 않게 admin 패밀리 사용.
 *  BE 상세 실구현됨(develop, AdminQuizController — 강사와 동일 InstructorQuizDetailResponse 반환) → toQuizDetail 공유.
 *  조회 실패(null) 시 상위 handleEdit가 목록값으로 폴백(문항 없이 열림, 안전망). */
export async function getAdminQuizDetailServer(
  quizId: number,
): Promise<Quiz | null> {
  if (isMock('quizzes')) {
    return mockQuizzes.find((q) => q.quizId === quizId) ?? null;
  }
  const res = await serverApi.get<ApiInstructorQuizDetail>(
    `/api/admin/quizzes/${quizId}`,
  );
  if (!res.success || !res.data) return null;
  return toQuizDetail(res.data);
}

/** ②③ 등록 폼 메타 — 강의의 실제 섹션(존재하는 주차) + 이미 퀴즈가 있는 주차.
 *  ② 드롭다운을 실제 섹션 기반으로(1~12 하드코딩 대체) / ③ 1주1퀴즈 중복 제외(라이브 퀴즈 목록에서 집계). */
export async function getQuizFormMetaServer(courseId: number): Promise<{
  weeks: number[];
  takenWeeks: number[];
}> {
  if (isMock('quizzes')) {
    return {
      weeks: Array.from({ length: 12 }, (_, i) => i + 1),
      takenWeeks: mockQuizzes
        .filter((q) => q.courseId === courseId)
        .map((q) => q.week),
    };
  }
  const [sections, quizzes] = await Promise.all([
    getCourseSectionsServer(courseId),
    getQuizzesServer(courseId),
  ]);
  return {
    // w>0만: 무번호 섹션(오리엔테이션 등)은 퀴즈 주차가 아니므로 드롭다운서 의도적으로 제외.
    weeks: [...new Set(sections.map((s) => s.week).filter((w) => w > 0))].sort(
      (a, b) => a - b,
    ),
    takenWeeks: quizzes.map((q) => q.week),
  };
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
  weekNumber: number; // 섹션 orderIndex 기반 주차(BE 제공, 2026-07-13) — 목록·리포트와 동일 스킴
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
    week: res.data.weekNumber, // BE 제공 weekNumber(목록 스킴) — 제목파싱 폐기, 목록↔통계 주차 정합
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

/** GET /api/admin/quizzes/courses/{courseId} 응답. ⚠️ WeeklyQuiz는 강사 목록(ApiInstructorQuizItem)과
 *  필드가 다르다 — 문제수는 totalQuestionCount, 등록일시는 examDate(BE가 응시일 필드명 유지). */
interface ApiAdminWeeklyQuiz {
  quizId: number;
  weekNumber: number;
  quizTitle: string;
  status: string;
  totalQuestionCount: number;
  examDate: string | null;
}
interface ApiAdminQuizList {
  courseId: number;
  weeks: ApiAdminWeeklyQuiz[];
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
      week: item.weekNumber,
      title: item.quizTitle,
      // BE 관리자 목록은 totalQuestionCount·examDate로 준다(강사 목록의 questionCount·createdAt과 필드명 다름).
      questionCount: item.totalQuestionCount,
      createdDate: item.examDate ? item.examDate.split('T')[0] : '',
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
    week: res.data.weekNumber, // BE 제공 weekNumber(목록 스킴) — 제목파싱 폐기, 목록↔통계 주차 정합
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
