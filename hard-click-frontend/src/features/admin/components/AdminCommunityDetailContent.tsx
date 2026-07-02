'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import LoadingModal from '@/components/ui/loadingModal';
import {
  getCommentsAction,
  deletePostAction,
  deleteCommentAction,
} from '@/features/community/actions';
import type { PostDetail, CommentItem } from '@/features/community/types';
import { BOARD_TYPE_LABEL } from '@/features/community/types';
import { formatDate } from '@/features/community/utils';
import DeleteConfirmModal from './DeleteConfirmModal';

const CATEGORY_STYLE: Record<string, string> = {
  질문게시판: 'bg-[#FEF3C7] text-[#D97706]',
  자유게시판: 'bg-[#EFF6FF] text-[#3B82F6]',
  스터디모집: 'bg-[#F3E8FF] text-[#9333EA]',
};

interface AdminCommunityDetailContentProps {
  postId: number;
  initialPost: PostDetail;
  initialComments: CommentItem[];
  readOnly?: boolean;
  highlightPost?: boolean;
  backToReportKey?: string;
  highlightCommentId?: number;
}

export default function AdminCommunityDetailContent({
  postId,
  initialPost,
  initialComments,
  readOnly = false,
  highlightPost = false,
  backToReportKey,
  highlightCommentId,
}: AdminCommunityDetailContentProps) {
  const router = useRouter();

  const post = initialPost;
  const [comments, setComments] = useState<CommentItem[]>(initialComments);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );
  const [deletingReplyInfo, setDeletingReplyInfo] = useState<{
    commentId: number;
    replyId: number;
  } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const category = BOARD_TYPE_LABEL[post.boardType];
  const isAccepted = post.status === 'ADOPTED';

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length ?? 0),
    0
  );

  const fetchComments = async () => {
    const result = await getCommentsAction(postId);
    if (result.success && result.data) {
      setComments(result.data.comments);
    } else {
      toast.error('댓글을 불러오지 못했습니다.');
    }
  };

  const handleDeletePost = async () => {
    setIsDeleteConfirmOpen(false);
    setIsDeleting(true);
    const result = await deletePostAction(postId);
    setIsDeleting(false);
    if (!result.success) {
      toast.error(result.message || '게시글 삭제에 실패했습니다.');
      return;
    }
    toast.success('게시글이 삭제되었습니다.');
    router.push('/admin/community');
  };

  const handleCommentDelete = async (commentId: number) => {
    const result = await deleteCommentAction(commentId);
    if (!result.success) {
      toast.error(result.message || '댓글 삭제에 실패했습니다.');
      return;
    }
    setDeletingCommentId(null);
    await fetchComments();
    toast.success('댓글이 삭제되었습니다.');
  };

  const handleReplyDelete = async (replyId: number) => {
    const result = await deleteCommentAction(replyId);
    if (!result.success) {
      toast.error(result.message || '답글 삭제에 실패했습니다.');
      return;
    }
    setDeletingReplyInfo(null);
    await fetchComments();
    toast.success('답글이 삭제되었습니다.');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* back button */}
      <button
        type="button"
        onClick={() =>
          router.push(
            backToReportKey !== undefined
              ? backToReportKey
                ? `/admin/reports?openReport=${encodeURIComponent(
                    backToReportKey
                  )}`
                : '/admin/reports'
              : '/admin/community'
          )
        }
        className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4B5563]"
      >
        <Image src="/icons/back.svg" alt="back" width={16} height={16} />
        {backToReportKey !== undefined
          ? '신고 관리로 돌아가기'
          : '목록으로 돌아가기'}
      </button>

      {/* post card */}
      <div
        className={`rounded-2xl border bg-white p-6 ${
          highlightPost
            ? 'border-[#F59E0B] shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
            : 'border-[#E2E8F0]'
        }`}
      >
        {/* badges */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLE[category]}`}
          >
            {category}
          </span>
          {post.subjectName && (
            <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
              {post.subjectName}
            </span>
          )}
          {category === '질문게시판' && isAccepted && (
            <span className="flex items-center gap-1 rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#059669]">
              <Image
                src="/icons/check.svg"
                alt="check"
                width={12}
                height={12}
              />
              채택 완료
            </span>
          )}
          {category === '질문게시판' && !isAccepted && (
            <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#D97706]">
              답변 대기
            </span>
          )}
        </div>

        {/* title */}
        <h1 className="mb-3 text-xl font-bold text-[#1E293B]">{post.title}</h1>

        {/* meta + delete */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span>{post.authorName}</span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Image
                src="/icons/commuEye.svg"
                alt="views"
                width={14}
                height={14}
              />
              {post.viewCount}
            </span>
          </div>
          {!readOnly && (
            <button type="button" onClick={() => setIsDeleteConfirmOpen(true)}>
              <Image
                src="/icons/trashIcon.svg"
                alt="삭제"
                width={18}
                height={18}
              />
            </button>
          )}
        </div>

        {/* content */}
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#374151]">
          {post.content}
        </p>

        {/* 첨부파일 */}
        {post.fileUrls && post.fileUrls.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              첨부파일
            </span>
            <div className="flex flex-wrap gap-3">
              {post.fileUrls.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreviewImage(url)}
                  className="overflow-hidden rounded-xl border border-[#E2E8F0]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`첨부이미지-${i + 1}`}
                    className="h-[180px] w-[240px] cursor-pointer object-cover transition hover:opacity-90"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* comments card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <div className="mb-6 flex items-center gap-2">
          <Image
            src="/icons/commuComment.svg"
            alt="comment"
            width={18}
            height={18}
          />
          <span className="font-semibold text-[#1E293B]">
            댓글 {totalComments}개
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.commentId}>
              <div
                className={`rounded-2xl p-4 ${
                  highlightCommentId === comment.commentId
                    ? 'border border-[#F59E0B] bg-white shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
                    : comment.isAccepted
                    ? 'border border-[#BBF7D0] bg-[#F0FDF4]'
                    : 'bg-[#F8FAFC]'
                }`}
              >
                {comment.isAccepted && (
                  <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-[#059669]">
                    <Image
                      src="/icons/check.svg"
                      alt="check"
                      width={12}
                      height={12}
                    />
                    채택된 답변
                  </div>
                )}

                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-sm font-semibold text-[#475569]">
                      {comment.authorName.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-[#1E293B]">
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setDeletingCommentId(comment.commentId)}
                    >
                      <Image
                        src="/icons/trashIcon.svg"
                        alt="삭제"
                        width={16}
                        height={16}
                      />
                    </button>
                  )}
                </div>

                <p className="mb-2 text-sm text-[#374151]">{comment.content}</p>
              </div>

              {/* replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 flex flex-col gap-2 pl-4">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.commentId}
                      className="flex items-start gap-2"
                    >
                      <Image
                        src="/icons/arrowLeftIcon.svg"
                        alt="reply"
                        width={14}
                        height={14}
                        className="mt-4 rotate-180 opacity-40"
                      />
                      <div
                        className={`flex-1 rounded-2xl p-4 ${
                          highlightCommentId === reply.commentId
                            ? 'border border-[#F59E0B] bg-white shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
                            : 'bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-sm font-semibold text-[#475569]">
                              {reply.authorName.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-[#1E293B]">
                              {reply.authorName}
                            </span>
                            <span className="text-xs text-[#94A3B8]">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingReplyInfo({
                                  commentId: comment.commentId,
                                  replyId: reply.commentId,
                                })
                              }
                            >
                              <Image
                                src="/icons/trashIcon.svg"
                                alt="삭제"
                                width={16}
                                height={16}
                              />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-[#374151]">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 이미지 미리보기 모달 */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-[#1E293B] transition hover:bg-white"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt="첨부 이미지 원본"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
          />
        </div>
      )}

      {/* 게시글 삭제 확인 모달 */}
      {isDeleteConfirmOpen && (
        <DeleteConfirmModal
          title="게시글 삭제"
          message="게시글을 삭제하시겠습니까?"
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeletePost}
        />
      )}

      {/* 삭제 로딩 */}
      {isDeleting && (
        <LoadingModal
          title="삭제 중입니다"
          description="잠시만 기다려주세요...."
        />
      )}

      {/* 댓글 삭제 확인 모달 */}
      {deletingCommentId !== null && (
        <DeleteConfirmModal
          title="댓글 삭제"
          message="댓글을 삭제하시겠습니까?"
          onCancel={() => setDeletingCommentId(null)}
          onConfirm={() => handleCommentDelete(deletingCommentId)}
        />
      )}

      {/* 대댓글 삭제 확인 모달 */}
      {deletingReplyInfo !== null && (
        <DeleteConfirmModal
          title="답글 삭제"
          message="답글을 삭제하시겠습니까?"
          onCancel={() => setDeletingReplyInfo(null)}
          onConfirm={() => handleReplyDelete(deletingReplyInfo.replyId)}
        />
      )}
    </div>
  );
}
