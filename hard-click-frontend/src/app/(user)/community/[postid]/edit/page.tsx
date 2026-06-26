'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import CommunityWriteForm from '@/features/community/components/CommunityWriteForm';
import { getPostDetailAction } from '@/features/community/actions';
import type { PostDetail } from '@/features/community/types';
import { BOARD_TYPE_LABEL } from '@/features/community/types';

export default function CommunityEditPage() {
  const { postid } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const postId = Number(postid);
    if (!postId) return;
    getPostDetailAction(postId).then((result) => {
      if (result.success && result.data) {
        setPost(result.data);
      } else {
        router.push('/community');
      }
      setIsLoading(false);
    });
  }, [postid, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-[#64748B]">
        불러오는 중...
      </div>
    );
  }
  if (!post) return null;

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
        postId={post.postId}
      />
    </div>
  );
}
