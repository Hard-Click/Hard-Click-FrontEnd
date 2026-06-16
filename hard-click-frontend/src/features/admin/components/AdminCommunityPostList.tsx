'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CommunityPostCard from '@/features/community/components/CommunityPostCard';
import StudyPostCard from '@/features/community/components/StudyPostCard';
import PostEmptyState from '@/features/community/components/PostEmptyState';
import LoadingModal from '@/components/ui/loadingModal';
import { deletePostAction } from '@/features/community/actions';
import {
  BOARD_TYPE_LABEL,
  type PostListItem,
} from '@/features/community/types';
import { formatDate } from '@/features/community/utils';
import DeleteConfirmModal from './DeleteConfirmModal';

/**
 * 관리자 커뮤니티 목록 — 스터디 게시글은 목록 카드에서 바로 삭제 가능.
 * 일반 게시글은 카드 클릭 → 상세 페이지에서 삭제.
 */
export default function AdminCommunityPostList({
  posts,
  isStudyTab = false,
}: {
  posts: PostListItem[];
  isStudyTab?: boolean;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (posts.length === 0) {
    return <PostEmptyState />;
  }

  const handleDelete = async (postId: number) => {
    setDeletingId(null);
    setIsDeleting(true);
    const result = await deletePostAction(postId);
    setIsDeleting(false);
    if (!result.success) {
      toast.error(result.message || '게시글 삭제에 실패했습니다.');
      return;
    }
    toast.success('게시글이 삭제되었습니다.');
    router.refresh();
  };

  return (
    <>
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
              onDelete={setDeletingId}
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

      {/* 게시글 삭제 확인 모달 */}
      {deletingId !== null && (
        <DeleteConfirmModal
          title="게시글 삭제"
          message="게시글을 삭제하시겠습니까?"
          onCancel={() => setDeletingId(null)}
          onConfirm={() => handleDelete(deletingId)}
        />
      )}

      {isDeleting && (
        <LoadingModal
          title="삭제 중입니다"
          description="잠시만 기다려주세요...."
        />
      )}
    </>
  );
}
