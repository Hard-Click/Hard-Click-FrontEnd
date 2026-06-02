import { api } from '@/services/api';
import type {
  BoardType,
  PostListResponse,
  PostDetail,
  CommentsResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  SubjectItem,
} from './types';

const USE_MOCK = true;

const MOCK_POST_LIST = [
  {
    postId: 1,
    boardType: 'QUESTION' as const,
    title: 'useEffect 무한 루프 문제 해결 방법이 궁금합니다',
    authorName: '이*호',
    viewCount: 145,
    commentCount: 3,
    status: 'ADOPTED' as const,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    postId: 2,
    boardType: 'FREE' as const,
    title: '수능 준비하면서 느낀 점 공유합니다',
    authorName: '박*영',
    viewCount: 321,
    commentCount: 2,
    status: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    postId: 3,
    boardType: 'STUDY' as const,
    title: '수학 스터디 같이 하실 분 구합니다',
    authorName: '김*수',
    viewCount: 89,
    commentCount: 0,
    status: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    postId: 4,
    boardType: 'QUESTION' as const,
    title: 'Next.js에서 use client를 언제 써야 하나요?',
    authorName: '곽*윤',
    viewCount: 210,
    commentCount: 1,
    status: 'PENDING' as const,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

const MOCK_POST_DETAIL: Record<number, PostDetail> = {
  1: {
    postId: 1,
    boardType: 'QUESTION',
    title: 'useEffect 무한 루프 문제 해결 방법이 궁금합니다',
    content:
      'useEffect 안에서 state를 변경하면 계속 무한 루프가 발생합니다.\n\n아래 코드처럼 작성했는데 어떻게 해결해야 할까요?\n\nuseEffect(() => {\n  setData(fetchData());\n}, [data]);',
    authorName: '이*호',
    viewCount: 145,
    status: 'ADOPTED',
    fileUrls: [],
    isMine: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  2: {
    postId: 2,
    boardType: 'FREE',
    title: '수능 준비하면서 느낀 점 공유합니다',
    content:
      '수능을 준비하면서 느낀 점들을 공유합니다.\n\n1. 꾸준함이 가장 중요합니다\n2. 자신만의 학습 방법을 찾는 것이 중요해요\n3. 오답 노트는 필수입니다\n4. 충분한 수면과 휴식도 중요합니다\n\n여러분 모두 파이팅!',
    authorName: '박*영',
    viewCount: 321,
    status: null,
    fileUrls: [],
    isMine: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  3: {
    postId: 3,
    boardType: 'STUDY',
    title: '수학 스터디 같이 하실 분 구합니다',
    content:
      '모집 인원: 5명\n\n수능 수학 1등급을 목표로 함께 공부할 스터디원을 모집합니다.',
    authorName: '김*수',
    viewCount: 89,
    status: null,
    fileUrls: [],
    isMine: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  4: {
    postId: 4,
    boardType: 'QUESTION',
    title: 'Next.js에서 use client를 언제 써야 하나요?',
    content:
      'Next.js 13버전 이후로 서버 컴포넌트와 클라이언트 컴포넌트가 나뉘었는데\n어떤 기준으로 use client를 써야 하는지 모르겠어요.',
    authorName: '곽*윤',
    viewCount: 210,
    status: 'PENDING',
    fileUrls: [],
    isMine: true,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
};

const MOCK_COMMENTS: Record<number, CommentsResponse> = {
  1: {
    comments: [
      {
        commentId: 1,
        authorName: '박*영',
        content:
          'dependency array에 data를 넣으면 data가 변경될 때마다 useEffect가 실행되고, 그 안에서 다시 data를 변경하니 무한 루프가 발생해요. dependency array를 비우거나 다른 값으로 변경해보세요.',
        imageUrl: null,
        isAccepted: true,
        isMine: false,
        createdAt: new Date(Date.now() - 7000000).toISOString(),
        replies: [
          {
            commentId: 2,
            authorName: '이*호',
            content: '그렇군요! 감사합니다. 해결됐습니다!',
            imageUrl: null,
            isMine: false,
            createdAt: new Date(Date.now() - 6800000).toISOString(),
          },
        ],
      },
      {
        commentId: 3,
        authorName: '김*수',
        content: 'useCallback을 사용하는 것도 좋은 방법입니다.',
        imageUrl: null,
        isAccepted: false,
        isMine: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        replies: [],
      },
    ],
  },
  2: {
    comments: [
      {
        commentId: 4,
        authorName: '이*호',
        content: '좋은 정보 감사합니다! 저도 오답 노트 시작해봐야겠어요.',
        imageUrl: null,
        isAccepted: false,
        isMine: false,
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        replies: [],
      },
    ],
  },
  3: { comments: [] },
  4: {
    comments: [
      {
        commentId: 5,
        authorName: '박*영',
        content:
          'useState, useEffect, useRef 같은 훅을 쓰거나 onClick 같은 이벤트 핸들러가 있을 때 use client를 씁니다!',
        imageUrl: null,
        isAccepted: false,
        isMine: false,
        createdAt: new Date(Date.now() - 300000).toISOString(),
        replies: [],
      },
    ],
  },
};

export async function getPosts(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string,
) {
  if (USE_MOCK) {
    let filtered =
      boardType === 'ALL'
        ? MOCK_POST_LIST
        : MOCK_POST_LIST.filter((p) => p.boardType === boardType);
    if (keyword) filtered = filtered.filter((p) => p.title.includes(keyword));
    return {
      success: true,
      httpStatus: 200,
      message: 'ok',
      data: { content: filtered, totalPages: 1 },
    };
  }
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (keyword) params.set('keyword', keyword);
  if (sort) params.set('sort', sort);
  return api.get<PostListResponse>(
    `/api/boards/${boardType}/posts?${params.toString()}`,
  );
}

export async function getSubjects() {
  return api.get<SubjectItem[]>('/api/subjects');
}

export async function getPostDetail(postId: number) {
  if (USE_MOCK) {
    const post = MOCK_POST_DETAIL[postId];
    if (!post)
      return {
        success: false,
        httpStatus: 404,
        message: '게시글을 찾을 수 없습니다.',
        data: undefined as unknown as PostDetail,
      };
    return { success: true, httpStatus: 200, message: 'ok', data: post };
  }
  return api.get<PostDetail>(`/api/posts/${postId}`);
}

export async function createPost(body: CreatePostRequest) {
  return api.post<{ postId: number }>('/api/posts', body);
}

export async function updatePost(postId: number, body: UpdatePostRequest) {
  return api.patch<{ postId: number }>(`/api/posts/${postId}`, body);
}

export async function deletePost(postId: number) {
  return api.delete<void>(`/api/posts/${postId}`);
}

export async function getComments(postId: number) {
  if (USE_MOCK) {
    const comments = MOCK_COMMENTS[postId] ?? { comments: [] };
    return { success: true, httpStatus: 200, message: 'ok', data: comments };
  }
  return api.get<CommentsResponse>(`/api/posts/${postId}/comments`);
}

export async function createComment(body: CreateCommentRequest) {
  return api.post<{ commentId: number }>('/api/comments', body);
}

export async function updateComment(
  commentId: number,
  body: UpdateCommentRequest,
) {
  return api.patch<{ commentId: number }>(`/api/comments/${commentId}`, body);
}

export async function deleteComment(commentId: number) {
  return api.delete<void>(`/api/comments/${commentId}`);
}

export async function acceptComment(commentId: number) {
  return api.post<{ isAccepted: boolean }>(
    `/api/comments/${commentId}/accept`,
    {},
  );
}
