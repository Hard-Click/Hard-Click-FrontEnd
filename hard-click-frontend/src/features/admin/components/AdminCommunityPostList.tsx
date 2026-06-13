'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CommunityPostCard from '@/features/community/components/CommunityPostCard';
import StudyPostCard from '@/features/community/components/StudyPostCard';
import PostEmptyState from '@/features/community/components/PostEmptyState';
import LoadingModal from '@/components/ui/loadingModal';
import { deletePostAction } from '@/features/community/actions';
import { BOARD_TYPE_LABEL, type PostListItem } from '@/features/community/types';

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

/**
 * 관리자 커뮤니티 목록 — 스터디 게시글은 목록 카드에서 바로 삭제 가능.
 * 일반 게시글은 카드 클릭 → 상세 페이지에서 삭제.
 */
export default function AdminCommunityPostList({
  posts,
}: {
  posts: PostListItem[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (posts.length === 0) {
    return <PostEmptyState />;
  }

  const isStudyTab = posts.every((p) => p.boardType === 'STUDY');

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-[448px] bg-white rounded-2xl p-8"
            style={{
              boxShadow:
                '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            }}
          >
            <h2 className="text-center text-2xl font-bold text-[#1F2937]">
              게시글 삭제
            </h2>
            <p className="mt-3 text-center text-base text-[#4B5563]">
              게시글을 삭제하시겠습니까?
              <br />
              <span className="text-sm text-[#DC2626]">
                삭제 후 복구가 불가능합니다.
              </span>
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="h-12 flex-1 rounded-[10px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleting && (
        <LoadingModal title="삭제 중입니다" description="잠시만 기다려주세요...." />
      )}
    </>
  );
}
