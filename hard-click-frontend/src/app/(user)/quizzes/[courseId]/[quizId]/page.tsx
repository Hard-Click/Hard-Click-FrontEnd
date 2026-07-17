import { notFound, redirect } from 'next/navigation';
import {
  getEnrolledCoursesServer,
  getStudentQuizDetailServer,
} from '@/features/quizzes/studentServer';
import QuizTakeClient from '@/features/quizzes/components/QuizTakeClient';

/**
 * 수강생 퀴즈 응시 화면 (Server Component) — `/quizzes/[courseId]/[quizId]`.
 * 문제(정답 제외)는 서버 조회 → 응시 상호작용·채점 제출은 client(QuizTakeClient).
 */
export default async function QuizTakePage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId: cIdStr, quizId: qIdStr } = await params;
  const courseId = Number(cIdStr);
  const quizId = Number(qIdStr);
  if (!Number.isInteger(courseId) || !Number.isInteger(quizId)) notFound();

  const [detail, courses] = await Promise.all([
    getStudentQuizDetailServer(courseId, quizId),
    // courseTitle 헤더(장식)용 — 수강목록 실패해도 응시 화면은 살린다(핵심 아님, 의도적 degrade).
    getEnrolledCoursesServer().catch(() => []),
  ]);
  if (!detail || detail.questions.length === 0) notFound();
  // 재응시 없음 — 이미 응시한 퀴즈는 결과(해설) 화면으로 리다이렉트
  if (detail.attempted) redirect(`/quizzes/${courseId}/${quizId}/review`);

  const courseTitle = courses.find((c) => c.courseId === courseId)?.title ?? '';

  // 응시 전용 배경 — 헤더(파란 바)를 숨겨 허전해진 상단을 은은한 브랜드 톤 그라데이션으로 보완.
  //   QuizTakeClient 래퍼는 max-w 중앙 컬럼(투명)이라, 이 그라데이션이 전체 폭 뒤로 깔린다.
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#EEF3FA] to-[#F8FAFC]">
      <QuizTakeClient detail={detail} courseTitle={courseTitle} />
    </div>
  );
}
