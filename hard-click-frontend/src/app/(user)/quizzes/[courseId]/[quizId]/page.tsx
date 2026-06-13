import { notFound } from 'next/navigation';
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
    getEnrolledCoursesServer(),
  ]);
  if (!detail || detail.questions.length === 0) notFound();

  const courseTitle = courses.find((c) => c.courseId === courseId)?.title ?? '';

  return <QuizTakeClient detail={detail} courseTitle={courseTitle} />;
}
