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
  } else if (!prog.progress && prog.status >= 400) {
    // 진도 조회 실패(401 만료·500 등)를 '0% 진도'로 위조하지 않는다(§0.1②) — 진도가 날아간 것처럼 보임 방지.
    //   기존엔 403/404만 걸러 401·500이 통과 → progress=null이 "완료 0/N·0%"로 렌더됐음.
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
