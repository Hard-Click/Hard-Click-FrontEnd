import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseProgressServer } from '@/features/learning/server';
import LearningCurriculumContent from './LearningCurriculumContent';

export default async function LearningCurriculumPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: idStr } = await params;
  const courseId = Number(idStr);

  if (!Number.isFinite(courseId)) {
    return (
      <LearningCurriculumContent detail={null} progress={null} errorStatus={404} />
    );
  }

  // 서버에서 강의 상세 + 진도 동시 확보
  const [detail, prog] = await Promise.all([
    getCourseDetailServer(courseId),
    getCourseProgressServer(courseId),
  ]);

  let errorStatus: number | null = null;
  if (!detail) {
    errorStatus = 404;
  } else if (!prog.progress && (prog.status === 403 || prog.status === 404)) {
    errorStatus = prog.status;
  }

  return (
    <LearningCurriculumContent
      detail={detail}
      progress={prog.progress}
      errorStatus={errorStatus}
    />
  );
}
