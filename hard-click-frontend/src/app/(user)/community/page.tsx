'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import CommunityFilterTabs from '@/features/community/components/CommunityFilterTabs';
import PostActionButtons from '@/features/community/components/PostActionButtons';
import { getPostsAction } from '@/features/community/actions';
import type { PostListItem } from '@/features/community/types';
import {
  BOARD_TYPE_LABEL,
  POST_STATUS_LABEL,
} from '@/features/community/types';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPostsAction('ALL').then((result) => {
      if (result.success && result.data) {
        setPosts(result.data.content);
      }
      setIsLoading(false);
    });
  }, []);

  const mappedPosts = posts.map((p) => ({
    id: p.postId,
    category: BOARD_TYPE_LABEL[p.boardType],
    title: p.title,
    author: p.authorName,
    time: formatDate(p.createdAt),
    views: p.viewCount,
    comments: p.commentCount,
    status: p.status ? POST_STATUS_LABEL[p.status] : undefined,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-3 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
                <Image
                  src="/icons/commu.svg"
                  alt="community"
                  width={30}
                  height={30}
                />
              </div>
              <h1 className="text-4xl font-bold text-[#1E293B]">커뮤니티</h1>
            </div>
            <p className="text-base text-[#4B5563]">
              함께 성장하는 학습 커뮤니티에 참여하세요
            </p>
          </div>
          <PostActionButtons />
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-[#64748B]">불러오는 중...</div>
        ) : (
          <CommunityFilterTabs posts={mappedPosts} />
        )}
      </div>
    </div>
  );
}
