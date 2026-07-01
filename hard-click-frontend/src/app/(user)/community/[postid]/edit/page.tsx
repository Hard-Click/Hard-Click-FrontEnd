import { notFound } from 'next/navigation';
import Image from 'next/image';
import CommunityWriteForm from '@/features/community/components/CommunityWriteForm';
import { getPostDetail } from '@/features/community/services';
import { getSubjects } from '@/features/community/server';
import type { SubjectItem } from '@/features/community/types';
import { BOARD_TYPE_LABEL } from '@/features/community/types';

interface CommunityEditPageProps {
  params: Promise<{ postid: string }>;
}

// Server Component: 글 상세 + 과목을 서버에서 조회해 폼에 props로 전달 (useEffect 페칭 X)
export default async function CommunityEditPage({
  params,
}: CommunityEditPageProps) {
  const { postid } = await params;
  const postId = Number(postid);

  const [postRes, subjectsRes] = await Promise.all([
    getPostDetail(postId),
    getSubjects(),
  ]);

  if (!postRes.success || !postRes.data) {
    notFound();
  }
  const post = postRes.data;
  const subjects: SubjectItem[] =
    subjectsRes.success && subjectsRes.data ? subjectsRes.data : [];

  return (
    <div>
      <div className="items-start flex gap-4 px-8 py-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
          <Image
            src="/icons/commu.svg"
            alt="community"
            width={30}
            height={30}
          />
        </div>
        <h1 className="mt-1 text-4xl font-bold text-[#1E293B]">게시글 수정</h1>
      </div>

      <CommunityWriteForm
        mode="edit"
        initialCategory={BOARD_TYPE_LABEL[post.boardType]}
        initialTitle={post.title}
        initialContent={post.content}
        initialFileUrls={post.fileUrls}
        initialSubject={post.subjectCode ?? ''}
        postId={post.postId}
        subjects={subjects}
      />
    </div>
  );
}
