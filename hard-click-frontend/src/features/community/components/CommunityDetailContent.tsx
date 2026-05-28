'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

interface Reply {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  isOwner: boolean;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  isOwner: boolean;
  isAccepted: boolean;
  replies: Reply[];
}

interface Post {
  id: number;
  category: '질문게시판' | '자유게시판' | '스터디모집';
  title: string;
  author: string;
  date: string;
  views: number;
  content: string;
  isOwner: boolean;
  isAccepted: boolean;
  comments: Comment[];
}

// TODO: API 연동 후 제거
const MOCK_POSTS: Record<number, Post> = {
  // 질문게시판 - 채택 완료
  1: {
    id: 1,
    category: '질문게시판',
    title: 'React Hook useEffect 사용 시 무한 루프 문제 해결 방법',
    author: '이*호',
    date: '2026.05.11 14:30',
    views: 145,
    content:
      'useEffect를 사용할 때 계속 무한 루프가 발생합니다.\n\n아래와 같은 코드를 작성했는데, 계속해서 useEffect가 실행되는 문제가 있습니다.\n\n```javascript\nuseEffect(() => {\n  setData(fetchData());\n}, [data]);\n```\n\n어떻게 해결해야 할까요?',
    isOwner: false,
    isAccepted: true,
    comments: [
      {
        id: 1,
        author: '박*영',
        avatar: '박',
        time: '2시간 전',
        content:
          'dependency array에 data를 넣으면 data가 변경될 때마다 useEffect가 실행되고, useEffect 안에서 다시 data를 변경하기 때문에 무한 루프가 발생합니다. dependency array를 비우거나 다른 값으로 변경해보세요.',
        isOwner: false,
        isAccepted: true,
        replies: [
          {
            id: 2,
            author: '이*호',
            avatar: '이',
            time: '2시간 전',
            content: '야 그렇군요! 감사합니다. 해결됐습니다!',
            isOwner: false,
          },
        ],
      },
      {
        id: 3,
        author: '김*수',
        avatar: '김',
        time: '1시간 전',
        content: 'useCallback을 사용하는 것도 좋은 방법입니다.',
        isOwner: true,
        isAccepted: false,
        replies: [],
      },
    ],
  },

  // 자유게시판
  2: {
    id: 2,
    category: '자유게시판',
    title: '프론트엔드 개발자 로드맵 공유합니다',
    author: '박*영',
    date: '2026.05.11 14:30',
    views: 321,
    content:
      '수능을 준비하면서 느낀 점들을 공유합니다.\n\n1. 꾸준함이 가장 중요합니다\n2. 자신만의 학습 방법을 찾는 것이 중요해요\n3. 오답 노트는 필수입니다\n4. 충분한 수면과 휴식도 중요합니다\n5. 모의고사는 실전처럼 풀어야 해요\n6. 포기하지 않는 마음가짐이 제일 중요합니다\n\n여러분 모두 파이팅!',
    isOwner: true,
    isAccepted: false,
    comments: [
      {
        id: 1,
        author: '이*호',
        avatar: '이',
        time: '1시간 전',
        content: '좋은 정보 감사합니다!',
        isOwner: false,
        isAccepted: false,
        replies: [],
      },
      {
        id: 2,
        author: '김*수',
        avatar: '김',
        time: '30분 전',
        content: '저도 공감합니다. 특히 오답 노트 정말 중요하더라고요',
        isOwner: true,
        isAccepted: false,
        replies: [
          {
            id: 3,
            author: '박*영',
            avatar: '박',
            time: '20분 전',
            content: '좋은 의견 감사합니다!',
            isOwner: false,
          },
        ],
      },
    ],
  },

  // 질문게시판 - 답변 대기
  3: {
    id: 3,
    category: '질문게시판',
    title: '가나다라',
    author: '이*윤',
    date: '2026.05.11 14:30',
    views: 120,
    content: '질문 내용입니다.',
    isOwner: true,
    isAccepted: false,
    comments: [],
  },
};

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

  // 댓글 등록
  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: '나', // TODO: 로그인 유저 정보로 교체
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

  // 답글 등록
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
          {/* 카테고리 뱃지 */}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLE[post.category]}`}
          >
            {post.category}
          </span>

          {/* 채택 완료 뱃지 */}
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

          {/* 답변 대기 뱃지 */}
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
                <button type="button">
                  <Image
                    src="/icons/editIcon.svg"
                    alt="수정"
                    width={18}
                    height={18}
                  />
                </button>
                <button type="button">
                  <Image
                    src="/icons/trashIcon.svg"
                    alt="삭제"
                    width={18}
                    height={18}
                  />
                </button>
              </>
            ) : (
              <button type="button">
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
              {/* comment */}
              <div
                className={`rounded-2xl p-4 ${
                  comment.isAccepted
                    ? 'border border-[#BBF7D0] bg-[#F0FDF4]'
                    : 'bg-[#F8FAFC]'
                }`}
              >
                {/* accepted badge */}
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

                {/* comment header */}
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
                    {/* 채택 버튼 - 질문게시판 + 게시글 작성자 + 미채택 상태 */}
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
                      <button type="button">
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

                {/* comment content */}
                <p className="mb-2 text-sm text-[#374151]">{comment.content}</p>

                {/* 답글 버튼 */}
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

                {/* 답글 입력창 */}
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

              {/* replies - 대댓글 */}
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
                              <button type="button">
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
        </div>
      </div>
    </div>
  );
}
