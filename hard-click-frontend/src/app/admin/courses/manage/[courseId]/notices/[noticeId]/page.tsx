import NoticeDetail from '@/features/notices/components/NoticeDetail';
import { getNoticeDetailServer } from '@/features/notices/server';

// 강의에서 진입하는 강의별 공지 상세 — 관리자 레이아웃 + '강의' nav active 유지.
export default async function AdminCourseNoticeDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; noticeId: string }>;
}) {
  const { courseId, noticeId } = await params;
  const notice = await getNoticeDetailServer(Number(noticeId));

  return (
    <NoticeDetail
      notice={notice}
      backHref={`/admin/courses/manage/${courseId}/notices`}
    />
  );
}
