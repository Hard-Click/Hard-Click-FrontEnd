import NoticeDetail from '@/features/notices/components/NoticeDetail';
import { getNoticeDetailServer } from '@/features/notices/server';

export default async function StudentNoticeDetailPage({
  params,
}: {
  params: Promise<{ noticeid: string }>;
}) {
  const { noticeid } = await params;
  const notice = await getNoticeDetailServer(Number(noticeid));

  return <NoticeDetail notice={notice} backHref="/notices" />;
}
