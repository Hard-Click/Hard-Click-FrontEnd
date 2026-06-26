import { notFound } from 'next/navigation';
import { getNoticeDetailServer } from '@/features/notices/server';
import InstructorNoticeDetailContent from './InstructorNoticeDetailContent';

export default async function InstructorNoticeDetailPage({
  params,
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = await params;
  const notice = await getNoticeDetailServer(Number(noticeId));
  if (!notice) notFound();

  return <InstructorNoticeDetailContent initialNotice={notice} />;
}
