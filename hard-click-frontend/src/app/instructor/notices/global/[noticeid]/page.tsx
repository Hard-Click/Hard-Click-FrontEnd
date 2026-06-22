import NoticeDetail from '@/features/notices/components/NoticeDetail';
import { getNoticeDetailServer } from '@/features/notices/server';

// 강사 레이아웃(헤더 유지) 하에서 학생과 동일한 전체 공지 상세를 표시한다.
export default async function InstructorGlobalNoticeDetailPage({
  params,
}: {
  params: Promise<{ noticeid: string }>;
}) {
  const { noticeid } = await params;
  const notice = await getNoticeDetailServer(Number(noticeid));

  return (
    <NoticeDetail notice={notice} backHref="/instructor/notices/global" />
  );
}
