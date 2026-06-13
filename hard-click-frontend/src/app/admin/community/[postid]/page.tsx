import { notFound } from 'next/navigation';
import { getPostDetail, getComments } from '@/features/community/services';
import AdminCommunityDetailContent from '@/features/admin/components/AdminCommunityDetailContent';

interface AdminCommunityDetailPageProps {
  params: Promise<{ postid: string }>;
}

// Server Component: 상세 + 댓글을 서버에서 가져와 props로 전달 (useEffect 없음)
export default async function AdminCommunityDetailPage({
  params,
}: AdminCommunityDetailPageProps) {
  const { postid } = await params;
  const postId = Number(postid);

  if (Number.isNaN(postId)) {
    notFound();
  }

  const [postRes, commentsRes] = await Promise.all([
    getPostDetail(postId),
    getComments(postId),
  ]);

  if (!postRes.success || !postRes.data) {
    notFound();
  }

  const initialComments =
    commentsRes.success && commentsRes.data ? commentsRes.data.comments : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <AdminCommunityDetailContent
          postId={postId}
          initialPost={postRes.data}
          initialComments={initialComments}
        />
      </div>
    </div>
  );
}
