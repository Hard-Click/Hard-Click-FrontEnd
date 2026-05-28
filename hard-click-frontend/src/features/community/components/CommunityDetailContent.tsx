'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import ReportModal from '@/features/reports/components/ReportModal';
import { MOCK_POSTS } from '../mock';
import { toast } from 'sonner';
import LoadingModal from '@/components/ui/loadingModal';

const CATEGORY_STYLE: Record<string, string> = {
  질문게시판: 'bg-[#FEF3C7] text-[#D97706]',
  자유게시판: 'bg-[#EFF6FF] text-[#3B82F6]',
  스터디모집: 'bg-[#F3E8FF] text-[#9333EA]',
};

export default function CommunityDetailContent() {
  const router = useRouter();
  const { postid } = useParams();
  const post = MOCK_POSTS[Number(postid)] ?? MOCK_POSTS[1];
  const [comments, setComments] = useState(post.comments);

  const [commentText, setCommentText] = useState('');
  const [replyInputId, setReplyInputId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isAccepted, setIsAccepted] = useState(post.isAccepted);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAccept = (commentId: number) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isAccepted: true } : c)),
    );
    setIsAccepted(true);
  };

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + c.replies.length,
    0,
  );

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: '나',
      avatar: '나',
      time: '방금 전',
      content: commentText,
      isOwner: true,
      isAccepted: false,
      replies: [],
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  const handleReplySubmit = (commentId: number) => {
    if (!replyText.trim()) return;
    const newReply = {
      id: Date.now(),
      author: '나',
      avatar: '나',
      time: '방금 전',
      content: replyText,
      isOwner: true,
    };
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c,
      ),
    );
    setReplyText('');
    setReplyInputId(null);
  };

  const handleDeletePost = async () => {
    setIsDeleteConfirmOpen(false);
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 800)); // 나중에 API로 교체
    setIsDeleting(false);
    toast.success('게시글이 삭제되었습니다.');
    router.push('/community');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* back button */}
      <button
        type="button"
        onClick={() => router.back()}
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
            className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLE[post.category]}`}
          >
            {post.category}
          </span>
          {post.category === '질문게시판' && isAccepted && (
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
          {post.category === '질문게시판' && !isAccepted && (
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
            <span>{post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Image
                src="/icons/commuEye.svg"
                alt="views"
                width={14}
                height={14}
              />
              {post.views}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {post.isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push(`/community/${postid}/edit`)}
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
              <button type="button" onClick={() => setIsReportOpen(true)}>
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
            <div key={comment.id}>
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
                      {comment.avatar}
                    </div>
                    <span className="text-sm font-semibold text-[#1E293B]">
                      {comment.author}
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      {comment.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.category === '질문게시판' &&
                      post.isOwner &&
                      !isAccepted &&
                      !comment.isAccepted && (
                        <button
                          type="button"
                          onClick={() => handleAccept(comment.id)}
                          className="rounded-full cursor-pointer bg-[#2F5DAA] px-3 py-1 text-xs font-semibold text-white"
                        >
                          채택
                        </button>
                      )}
                    {comment.isOwner ? (
                      <>
                        <button type="button">
                          <Image
                            src="/icons/editIcon.svg"
                            alt="수정"
                            width={16}
                            height={16}
                          />
                        </button>
                        <button type="button">
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
                        onClick={() => setIsReportOpen(true)}
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

                <p className="mb-2 text-sm text-[#374151]">{comment.content}</p>

                <button
                  type="button"
                  onClick={() =>
                    setReplyInputId(
                      replyInputId === comment.id ? null : comment.id,
                    )
                  }
                  className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#2F5DAA]"
                >
                  ↩ 답글
                </button>

                {replyInputId === comment.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="답글을 입력하세요"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none placeholder:text-[#9CA3AF]"
                    />
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(comment.id)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                        replyText.trim()
                          ? 'bg-[#2F5DAA]'
                          : 'bg-[#2F5DAA] opacity-50'
                      }`}
                    >
                      등록
                    </button>
                  </div>
                )}
              </div>

              {/* replies */}
              {comment.replies.length > 0 && (
                <div className="mt-2 flex flex-col gap-2 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2">
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
                              {reply.avatar}
                            </div>
                            <span className="text-sm font-semibold text-[#1E293B]">
                              {reply.author}
                            </span>
                            <span className="text-xs text-[#94A3B8]">
                              {reply.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {reply.isOwner ? (
                              <>
                                <button type="button">
                                  <Image
                                    src="/icons/editIcon.svg"
                                    alt="수정"
                                    width={16}
                                    height={16}
                                  />
                                </button>
                                <button type="button">
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
                                onClick={() => setIsReportOpen(true)}
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

        {/* divider */}
        <div className="my-6 h-px bg-[#E2E8F0]" />

        {/* comment input */}
        <div className="flex gap-2">
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

          {isReportOpen && (
            <ReportModal onClose={() => setIsReportOpen(false)} />
          )}
        </div>
      </div>
      {/* 삭제 확인 모달 */}
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

      <div className="flex flex-col gap-4"></div>
    </div>
  );
}
