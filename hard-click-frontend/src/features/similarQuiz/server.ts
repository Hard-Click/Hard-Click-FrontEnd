import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { getEnrolledCoursesServer } from '@/features/quizzes/studentServer';
import { getSimilarQuizMock } from '@/mocks/similarQuiz.mock';
import type { SimilarQuizDetail } from './types';

/* ─────────────────────────────────────────────────────────────────────────
 * 유사퀴즈 조회 — 진입 시 BE가 동기 생성한 유사문제를 받아 응시 화면에 바로 표시.
 * 유사퀴즈 = **강의(course) 단위**: 그 강의의 오답 전체 기반. 주차와 무관 → 강의 하나에 유사퀴즈 하나.
 *
 * ⚠️ 상태(§0.1④): config MOCK_OVERRIDE.similarQuiz=false → **라이브**(mock 아님, 2026-07-16 전환).
 *   조회(POST /api/similar-quizzes)는 ALB 라이브 검증(200·courseId 요청·응답 shape 일치).
 *   ⚠️ 제출/채점(submitSimilarQuizAction)은 BE **develop엔 있으나 prod(main) 미배포** → 배포 전엔 404
 *   (정직하게 '제출 실패' 토스트, 가짜 채점 안 함). 응답 shape은 BE 계약 기준(생성 검증, 제출 라이브
 *   미검증 §0.1①). BE develop→main 배포 시 완전 작동.
 * ───────────────────────────────────────────────────────────────────────── */

/** POST /api/similar-quizzes 응답 — 가정 shape(정답·해설 제외). */
interface ApiSimilarQuiz {
  similarQuizId: number;
  courseId: number;
  title: string;
  questions: { questionId: number; content: string; options: string[] }[];
}

/**
 * 유사퀴즈 조회(동기 생성). 오답이 없어 BE가 생성 안 하면 null(정상 empty).
 * 실패(403/401/500)는 null로 삼키지 않고 throw → error.tsx가 처리(§0.1④).
 * @param courseId 강의 id (유사퀴즈는 강의 단위 — 그 강의의 오답 전체 기반)
 */
export async function getSimilarQuizServer(
  courseId: number,
): Promise<SimilarQuizDetail | null> {
  if (isMock('similarQuiz')) {
    return getSimilarQuizMock(courseId);
  }

  // ── 라이브(BE 완성 후) — 가정 shape, 미검증 ──
  // courseTitle은 BE ① 응답에 없어 수강목록에서 보완(리뷰 화면과 동일 패턴). 병렬 조회.
  const [res, courses] = await Promise.all([
    serverApi.post<ApiSimilarQuiz>('/api/similar-quizzes', { courseId }),
    getEnrolledCoursesServer(),
  ]);
  // 실패(403 구독게이트·401 세션만료·500)를 '오답 없음' 빈상태로 위장하지 않는다(§0.1④).
  //   serverApi는 4xx/5xx에 throw 없이 {success:false}를 주므로, 여기서 명시적으로 throw해 error.tsx로 올린다.
  if (!res.success) {
    throw new Error(`유사퀴즈 조회 실패 (${res.httpStatus}): ${res.message}`);
  }
  // 성공 — data 없음/문항 0 = BE가 오답 0개라 생성 안 함(정상 empty) → null 반환(page가 '유사 문제 없음' 안내).
  if (!res.data || res.data.questions.length === 0) return null;
  const d = res.data;
  const courseTitle = courses.find((c) => c.courseId === courseId)?.title ?? '';
  return {
    similarQuizId: d.similarQuizId,
    courseId, // 라우팅/제출용
    courseTitle,
    title: d.title,
    questions: d.questions.map((q) => ({
      questionId: q.questionId,
      content: q.content,
      options: q.options,
    })),
  };
}
