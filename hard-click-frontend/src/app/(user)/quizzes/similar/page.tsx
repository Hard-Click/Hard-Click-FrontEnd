import { getSimilarQuizServer } from '@/features/similarQuiz/server';
import SimilarQuizClient from '@/features/similarQuiz/components/SimilarQuizClient';
import SimilarQuizEmptyState from '@/features/similarQuiz/components/SimilarQuizEmptyState';

/**
 * 유사퀴즈(오답 기반 AI 유사문제) 진입 화면 (Server Component) — `/quizzes/similar`.
 * 유사퀴즈 = **강의(course) 단위**: 그 강의의 오답 전체 기반. 주차와 무관.
 * 구독자가 캘린더(곽시윤 #876)에서 진입 → 강의 오답 기반 유사문제를 풀고 → 제출 즉시 해설.
 *
 * 흐름: 서버에서 ①조회(동기 생성) → SimilarQuizClient에 전달 → 응시·제출·결과는 같은 화면 상태전환.
 * ⚠️ 진입 파라미터(courseId)는 캘린더 진입점(#876) 확정 시 최종 조정 — 현재는 쿼리스트링 가정.
 * ⚠️ 구독 게이트는 BE가 403으로 막음(보안). FE 리다이렉트는 BE 연동/캘린더 확정 시 추가.
 *
 * 정적 세그먼트 `similar`는 형제 동적 세그먼트 `[courseId]`보다 우선 → /quizzes/similar 는 이 화면.
 */
export default async function SimilarQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const { courseId: cStr } = await searchParams;
  const courseId = Number(cStr);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return <SimilarQuizEmptyState variant="invalid" />;
  }

  const detail = await getSimilarQuizServer(courseId);
  // detail===null = BE가 오답 0개라 생성 안 함(정상 empty) → '유사 문제 없음' 안내.
  // 실패(403/401/500)는 server에서 throw → error.tsx가 처리(빈상태로 위장 안 함, §0.1④).
  if (!detail || detail.questions.length === 0) {
    return <SimilarQuizEmptyState variant="empty" courseId={courseId} />;
  }

  // 응시 전용 배경 — 일반 퀴즈 응시와 동일한 은은한 브랜드 톤 그라데이션(헤더 숨김 보완).
  //   SimilarQuizClient가 응시↔결과 상태전환을 감싸므로 두 단계 모두 이 배경 위에 뜬다.
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#EEF3FA] to-[#F8FAFC]">
      <SimilarQuizClient detail={detail} />
    </div>
  );
}
