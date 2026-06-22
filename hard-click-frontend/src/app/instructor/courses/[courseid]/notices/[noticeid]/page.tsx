import NoticeDetail from '@/features/notices/components/NoticeDetail';
import { getNoticeDetailServer } from '@/features/notices/server';

// 강의에서 진입하는 강의별 공지 상세 — 강사 레이아웃 + '강의' nav active 유지.
export default async function InstructorCourseNoticeDetailPage({
  params,
}: {
  params: Promise<{ courseid: string; noticeid: string }>;
}) {
  const { courseid, noticeid } = await params;
  const id = Number(noticeid);
  const notice = Number.isNaN(id) ? null : await getNoticeDetailServer(id);

  return (
    <NoticeDetail
      notice={notice}
      backHref={`/instructor/courses/${courseid}/notices`}
    />
  );
}
