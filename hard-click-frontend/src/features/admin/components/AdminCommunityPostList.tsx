'use client';

import { useRouter } from 'next/navigation';
import CommunityPostCard from '@/features/community/components/CommunityPostCard';
import StudyPostCard from '@/features/community/components/StudyPostCard';
import PostEmptyState from '@/features/community/components/PostEmptyState';
import {
  BOARD_TYPE_LABEL,
  type PostListItem,
} from '@/features/community/types';
import { formatDate } from '@/features/community/utils';

export default function AdminCommunityPostList({
  posts,
  isStudyTab = false,
}: {
  posts: PostListItem[];
  isStudyTab?: boolean;
}) {
  const router = useRouter();

  if (posts.length === 0) {
    return <PostEmptyState />;
  }

  return (
    <div
      className={`mt-6 ${
        isStudyTab ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'
      }`}
    >
      {posts.map((post) =>
        post.boardType === 'STUDY' ? (
          <StudyPostCard
            key={post.postId}
            id={post.postId}
            title={post.title}
            subjectName={post.subjectName ?? ''}
            description={post.description ?? '함께 공부하실 분을 찾습니다'}
            currentCount={post.currentCount ?? 0}
            maxCount={post.maxCount ?? 0}
            author={post.authorName}
            time={formatDate(post.createdAt)}
            variant={isStudyTab ? 'grid' : 'list'}
            hrefPrefix="/admin/community"
            actionLabel="채팅방 보기"
          />
        ) : (
          <CommunityPostCard
            key={post.postId}
            id={post.postId}
            category={BOARD_TYPE_LABEL[post.boardType]}
            subjectName={post.subjectName ?? undefined}
            title={post.title}
            author={post.authorName}
            time={formatDate(post.createdAt)}
            views={post.viewCount}
            comments={post.commentCount}
            status={
              post.boardType === 'QUESTION'
                ? post.status === 'ADOPTED'
                  ? '채택 완료'
                  : '답변 대기'
                : undefined
            }
            hrefPrefix="/admin/community"
          />
        )
      )}
    </div>
  );
}
