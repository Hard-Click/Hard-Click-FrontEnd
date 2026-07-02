'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ReportModal from '@/features/reports/components/ReportModal';
import type { ReportTargetRef } from '@/features/reports/types';
import { toast } from '@/lib/toast';
import LoadingModal from '@/components/ui/loadingModal';
import {
  deletePostAction,
  getPostDetailAction,
  getCommentsAction,
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
  acceptCommentAction,
} from '../actions';
import type { PostDetail, CommentItem } from '../types';
import { BOARD_TYPE_LABEL } from '../types';
import { parseServerDate } from '../utils';
import { useMemberStatus } from '@/features/community/MemberStatusProvider';

const CATEGORY_STYLE: Record<string, string> = {
  질문게시판: 'bg-[#FEF3C7] text-[#D97706]',
  자유게시판: 'bg-[#EFF6FF] text-[#3B82F6]',
  스터디모집: 'bg-[#F3E8FF] text-[#9333EA]',
};

function formatDate(isoString: string): string {
  const date = parseServerDate(isoString);
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

interface CommunityDetailContentProps {
  postId: number;
  initialPost: PostDetail;
  initialComments: CommentItem[];
}

export default function CommunityDetailContent({
  postId,
  initialPost,
  initialComments,
}: CommunityDetailContentProps) {
  const router = useRouter();
  const { isSuspended, suspendedMessage } = useMemberStatus();

  // 데이터는 서버(page.tsx)에서 받아온 초기값으로 시작. mutation 후엔 핸들러에서
  // getCommentsAction/getPostDetailAction으로 직접 재조회해 state를 갱신한다.
  const [post, setPost] = useState<PostDetail>(initialPost);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);

  const [commentText, setCommentText] = useState('');
  const [replyInputId, setReplyInputId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportTarget, setReportTarget] = useState<ReportTargetRef | null>(
    null,
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editingReplyText, setEditingReplyText] = useState('');
  const [deletingReplyInfo, setDeletingReplyInfo] = useState<{
    commentId: number;
    replyId: number;
  } | null>(null);

  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(
    null
  );
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(
    null
  );
  const commentFileRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);

  // 댓글 목록을 서버에서 직접 재조회해 state 동기화. 성공 여부를 반환해
  // 호출부가 "재조회 실패 시 성공 토스트를 띄우지 않도록" 분기할 수 있게 한다.
  const refreshComments = async (): Promise<boolean> => {
    const result = await getCommentsAction(postId);
    if (result.success && result.data) {
      setComments(result.data.comments);
      return true;
    }
    toast.error(result.message || '댓글 목록을 불러오지 못했습니다.');
    return false;
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const category = BOARD_TYPE_LABEL[post.boardType];
  const isAccepted = post.status === 'ADOPTED';

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length ?? 0),
    0
  );

  const handleAccept = async (commentId: number) => {
    const result = await acceptCommentAction(commentId);
    if (!result.success) {
      toast.error(result.message || '채택에 실패했습니다.');
      return;
    }
    const [postResult] = await Promise.all([getPostDetailAction(postId), refreshComments()]);
    if (postResult.success && postResult.data) setPost(postResult.data);
    toast.success('답변이 채택되었습니다.');
  };

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'comment' | 'reply'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!ALLOWED.includes(file.type)) {
      toast.error('jpg, png 형식만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지는 5MB 이하만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }
    const preview = URL.createObjectURL(file);
    if (type === 'comment') {
      setCommentImage(file);
      setCommentImagePreview(preview);
    } else {
      setReplyImage(file);
      setReplyImagePreview(preview);
    }
    e.target.value = '';
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    const fd = new FormData();
    fd.append('postId', String(postId));
    fd.append('content', commentText);
    if (commentImage) fd.append('image', commentImage);

    const result = await createCommentAction(fd);
    if (!result.success) {
      toast.error(result.message || '댓글 등록에 실패했습니다.');
      return;
    }
    setCommentText('');
    setCommentImage(null);
    setCommentImagePreview(null);
    // 재조회 실패 시(예: 목록 API 오류) 성공 토스트를 띄우지 않아 혼란 방지
    if (await refreshComments()) toast.success('댓글 등록이 완료되었습니다.');
  };

  const handleReplySubmit = async (parentCommentId: number) => {
    if (!replyText.trim()) return;
    const fd = new FormData();
    fd.append('postId', String(postId));
    fd.append('content', replyText);
    fd.append('parentId', String(parentCommentId));
    if (replyImage) fd.append('image', replyImage);

    const result = await createCommentAction(fd);
    if (!result.success) {
      toast.error(result.message || '답글 등록에 실패했습니다.');
      return;
    }
    setReplyText('');
    setReplyImage(null);
    setReplyImagePreview(null);
    setReplyInputId(null);
    if (await refreshComments()) toast.success('답글 등록이 완료되었습니다.');
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
    router.push('/community');
  };

  const handleCommentEditStart = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(content);
  };

  const handleCommentEditSave = async (commentId: number) => {
    if (!editingCommentText.trim()) return;
    const result = await updateCommentAction(commentId, {
      content: editingCommentText,
    });
    if (!result.success) {
      toast.error(result.message || '댓글 수정에 실패했습니다.');
      return;
    }
    setEditingCommentId(null);
    setEditingCommentText('');
    if (await refreshComments()) toast.success('댓글이 수정되었습니다.');
  };

  const handleCommentEditCancel = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleCommentDelete = async (commentId: number) => {
    const result = await deleteCommentAction(commentId);
    if (!result.success) {
      toast.error(result.message || '댓글 삭제에 실패했습니다.');
      return;
    }
    setDeletingCommentId(null);
    if (await refreshComments()) toast.success('댓글이 삭제되었습니다.');
  };

  const handleReplyEditStart = (replyId: number, content: string) => {
    setEditingReplyId(replyId);
    setEditingReplyText(content);
  };

  const handleReplyEditSave = async (replyId: number) => {
    if (!editingReplyText.trim()) return;
    const result = await updateCommentAction(replyId, {
      content: editingReplyText,
    });
    if (!result.success) {
      toast.error(result.message || '답글 수정에 실패했습니다.');
      return;
    }
    setEditingReplyId(null);
    setEditingReplyText('');
    if (await refreshComments()) toast.success('답글이 수정되었습니다.');
  };

  const handleReplyEditCancel = () => {
    setEditingReplyId(null);
    setEditingReplyText('');
  };

  const handleReplyDelete = async (replyId: number) => {
    const result = await deleteCommentAction(replyId);
    if (!result.success) {
      toast.error(result.message || '답글 삭제에 실패했습니다.');
      return;
    }
    setDeletingReplyInfo(null);
    if (await refreshComments()) toast.success('답글이 삭제되었습니다.');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* back button */}
      <button
        type="button"
        onClick={() => router.push('/community')}
        className="mb-6 cursor-pointer flex items-center gap-2 text-sm font-medium text-[#4B5563]"
      >
        <Image src="/icons/back.svg" alt="back" width={16} height={16} />
        목록으로 돌아가기
      </button>

      {/* post card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
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

        {/* meta + actions */}
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
          <div className="flex items-center gap-3">
            {post.isMine ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push(`/community/${postId}/edit`)}
                >
                  <Image
                    src="/icons/editIcon.svg"
                    alt="수정"
                    width={18}
                    height={18}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Image
                    src="/icons/trashIcon.svg"
                    alt="삭제"
                    width={18}
                    height={18}
                  />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setReportTarget({ targetType: 'POST', targetId: postId })
                }
              >
                <Image
                  src="/icons/reportFlagIcon.svg"
                  alt="신고"
                  width={18}
                  height={18}
                />
              </button>
            )}
          </div>
        </div>

        {/* content */}
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#374151]">
          {post.content}
        </p>

        {/* 첨부파일 — 썸네일 클릭 시 모달 확대 */}
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
                  {/* next/image: 표시 크기(240×180)로 자동 리사이즈·WebP·lazy → 원본 풀해상도 다운로드 방지 */}
                  <Image
                    src={url}
                    alt={`첨부이미지-${i + 1}`}
                    width={240}
                    height={180}
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
        {/* comment count */}
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

        {/* comment list */}
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.commentId}>
              <div
                className={`rounded-2xl p-4 ${
                  comment.isAccepted
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
                  <div className="flex items-center gap-2">
                    {category === '질문게시판' &&
                      post.isMine &&
                      !isAccepted &&
                      !comment.isAccepted &&
                      !comment.isMine && (
                        <button
                          type="button"
                          onClick={() => handleAccept(comment.commentId)}
                          className="rounded-full cursor-pointer bg-[#2F5DAA] px-3 py-1 text-xs font-semibold text-white"
                        >
                          채택
                        </button>
                      )}
                    {comment.isMine && !comment.isDeleted ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleCommentEditStart(
                              comment.commentId,
                              comment.content
                            )
                          }
                        >
                          <Image
                            src="/icons/editIcon.svg"
                            alt="수정"
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeletingCommentId(comment.commentId)
                          }
                        >
                          <Image
                            src="/icons/trashIcon.svg"
                            alt="삭제"
                            width={16}
                            height={16}
                          />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setReportTarget({
                            targetType: 'COMMENT',
                            targetId: comment.commentId,
                          })
                        }
                      >
                        <Image
                          src="/icons/reportFlagIcon.svg"
                          alt="신고"
                          width={16}
                          height={16}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {editingCommentId === comment.commentId ? (
                  <div className="mb-2">
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className="w-full rounded-xl border border-[#2F5DAA] px-3 py-2 text-sm outline-none resize-none"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCommentEditCancel}
                        className="rounded-lg border border-[#E2E8F0] px-3 py-1 text-xs font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCommentEditSave(comment.commentId)}
                        className="rounded-lg bg-[#2F5DAA] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1D3E75]"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`mb-2 text-sm ${
                      comment.isDeleted ? 'italic text-[#94A3B8]' : 'text-[#374151]'
                    }`}
                  >
                    {comment.isDeleted ? '삭제된 댓글입니다.' : comment.content}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setReplyInputId(
                      replyInputId === comment.commentId
                        ? null
                        : comment.commentId
                    )
                  }
                  className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#2F5DAA]"
                >
                  ↩ 답글
                </button>

                {replyInputId === comment.commentId && (
                  <div className="mt-3 flex flex-col gap-2">
                    {replyImagePreview && (
                      <div className="relative h-[70px] w-[70px] overflow-hidden rounded-xl border border-[#E2E8F0]">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyImage(null);
                            setReplyImagePreview(null);
                          }}
                          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                        >
                          ✕
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={replyImagePreview}
                          alt="첨부 미리보기"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => replyFileRef.current?.click()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC]"
                      >
                        <Image
                          src="/icons/image.svg"
                          alt="이미지 첨부"
                          width={18}
                          height={18}
                        />
                      </button>
                      <input
                        ref={replyFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelect(e, 'reply')}
                        className="hidden"
                      />
                      <input
                        type="text"
                        placeholder="답글을 입력하세요"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none placeholder:text-[#9CA3AF]"
                      />
                      <button
                        type="button"
                        onClick={() => handleReplySubmit(comment.commentId)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                          replyText.trim()
                            ? 'bg-[#2F5DAA]'
                            : 'bg-[#2F5DAA] opacity-50'
                        }`}
                      >
                        등록
                      </button>
                    </div>
                  </div>
                )}
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
                      <div className="flex-1 rounded-2xl bg-[#F8FAFC] p-4">
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
                          <div className="flex items-center gap-2">
                            {reply.isMine && !reply.isDeleted ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReplyEditStart(
                                      reply.commentId,
                                      reply.content
                                    )
                                  }
                                >
                                  <Image
                                    src="/icons/editIcon.svg"
                                    alt="수정"
                                    width={16}
                                    height={16}
                                  />
                                </button>
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
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setReportTarget({
                                    targetType: 'COMMENT',
                                    targetId: reply.commentId,
                                  })
                                }
                              >
                                <Image
                                  src="/icons/reportFlagIcon.svg"
                                  alt="신고"
                                  width={16}
                                  height={16}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                        {editingReplyId === reply.commentId ? (
                          <div>
                            <textarea
                              value={editingReplyText}
                              onChange={(e) =>
                                setEditingReplyText(e.target.value)
                              }
                              className="w-full rounded-xl border border-[#2F5DAA] px-3 py-2 text-sm outline-none resize-none"
                              rows={3}
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={handleReplyEditCancel}
                                className="rounded-lg border border-[#E2E8F0] px-3 py-1 text-xs font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleReplyEditSave(reply.commentId)
                                }
                                className="rounded-lg bg-[#2F5DAA] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1D3E75]"
                              >
                                저장
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className={`text-sm ${
                              reply.isDeleted ? 'italic text-[#94A3B8]' : 'text-[#374151]'
                            }`}
                          >
                            {reply.isDeleted ? '삭제된 댓글입니다.' : reply.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* divider */}
        <div className="my-6 h-px bg-[#E2E8F0]" />

        {/* comment input */}
        {isSuspended ? (
          <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-5 py-4 text-sm text-[#EF4444]">
            {suspendedMessage ?? '커뮤니티 작성이 제한된 계정입니다. 댓글을 작성할 수 없습니다.'}
          </div>
        ) : (
        <div className="flex flex-col gap-2">
          {commentImagePreview && (
            <div className="relative h-[80px] w-[80px] overflow-hidden rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setCommentImage(null);
                  setCommentImagePreview(null);
                }}
                className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              >
                ✕
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={commentImagePreview}
                alt="첨부 미리보기"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => commentFileRef.current?.click()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC]"
            >
              <Image
                src="/icons/image.svg"
                alt="이미지 첨부"
                width={20}
                height={20}
              />
            </button>
            <input
              ref={commentFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'comment')}
              className="hidden"
            />
            <input
              type="text"
              placeholder="댓글을 입력하세요"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm outline-none placeholder:text-[#9CA3AF]"
            />
            <button
              type="button"
              onClick={handleCommentSubmit}
              className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                commentText.trim() ? 'bg-[#2F5DAA]' : 'bg-[#2F5DAA] opacity-50'
              }`}
            >
              등록
            </button>
          </div>
        </div>
        )}
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
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                className="h-12 flex-1 rounded-[10px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-[448px] bg-white rounded-2xl p-8"
            style={{
              boxShadow:
                '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            }}
          >
            <h2 className="text-center text-2xl font-bold text-[#1F2937]">
              댓글 삭제
            </h2>
            <p className="mt-3 text-center text-base text-[#4B5563]">
              댓글을 삭제하시겠습니까?
              <br />
              <span className="text-sm text-[#DC2626]">
                삭제 후 복구가 불가능합니다.
              </span>
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingCommentId(null)}
                className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleCommentDelete(deletingCommentId)}
                className="h-12 flex-1 rounded-[10px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 대댓글 삭제 확인 모달 */}
      {deletingReplyInfo !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-[448px] bg-white rounded-2xl p-8"
            style={{
              boxShadow:
                '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            }}
          >
            <h2 className="text-center text-2xl font-bold text-[#1F2937]">
              답글 삭제
            </h2>
            <p className="mt-3 text-center text-base text-[#4B5563]">
              답글을 삭제하시겠습니까?
              <br />
              <span className="text-sm text-[#DC2626]">
                삭제 후 복구가 불가능합니다.
              </span>
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingReplyInfo(null)}
                className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleReplyDelete(deletingReplyInfo.replyId)}
                className="h-12 flex-1 rounded-[10px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신고 사유 모달 — 깃발 클릭 시 표시 (신고하기 → 확인 모달은 내부에서) */}
      {reportTarget && (
        <ReportModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
