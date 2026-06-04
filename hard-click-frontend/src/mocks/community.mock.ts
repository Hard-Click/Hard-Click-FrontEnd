import type {
  PostListResponse,
  PostDetail,
  CommentsResponse,
  SubjectItem,
} from '@/features/community/types';

/**
 * 커뮤니티 도메인 목 데이터 — 백엔드 응답 명세(shape) 그대로.
 */

/** GET /api/subjects */
export const mockSubjects: SubjectItem[] = [
  { subjectId: 1, subjectName: '국어', courseCount: 12 },
  { subjectId: 3, subjectName: '수학Ⅱ', courseCount: 10 },
  { subjectId: 8, subjectName: '생명과학Ⅰ', courseCount: 5 },
];

/** GET /api/boards/posts */
export const mockPostListResponse: PostListResponse = {
  posts: [
    {
      postId: 1,
      boardType: 'QUESTION',
      title: 'React useEffect 무한 루프 질문',
      authorName: '이*호',
      viewCount: 145,
      commentCount: 2,
      createdAt: '2026-05-11T14:30:00',
    },
    {
      postId: 2,
      boardType: 'FREE',
      title: '수능 공부 팁 공유합니다',
      authorName: '박*영',
      viewCount: 321,
      commentCount: 3,
      createdAt: '2026-05-10T10:00:00',
    },
    {
      postId: 3,
      boardType: 'QUESTION',
      title: '미적분 극한 개념 질문',
      authorName: '이*윤',
      viewCount: 120,
      commentCount: 0,
      createdAt: '2026-05-09T09:00:00',
    },
  ],
  currentPage: 0,
  totalPages: 1,
  totalCount: 3,
};

/** GET /api/posts/{postId} */
export const mockPostDetail: PostDetail = {
  postId: 1,
  boardType: 'QUESTION',
  title: 'React useEffect 무한 루프 질문',
  content:
    'useEffect 의존성 배열에 data를 넣었더니 무한 루프가 발생합니다. 어떻게 해결하나요?',
  authorName: '이*호',
  viewCount: 145,
  isMyPost: false,
  isAccepted: true,
  fileUrls: [],
  createdAt: '2026-05-11T14:30:00',
};

/** GET /api/posts/{postId}/comments */
export const mockCommentsResponse: CommentsResponse = {
  comments: [
    {
      commentId: 1,
      authorName: '박*영',
      content: '의존성 배열을 비우거나 다른 값으로 바꿔보세요.',
      isAccepted: true,
      isMine: false,
      createdAt: '2026-05-11T15:00:00',
      replies: [
        {
          commentId: 2,
          authorName: '이*호',
          content: '감사합니다! 해결됐어요.',
          isMine: true,
          createdAt: '2026-05-11T15:10:00',
        },
      ],
    },
    {
      commentId: 3,
      authorName: '김*수',
      content: 'useCallback도 좋은 방법입니다.',
      isAccepted: false,
      isMine: false,
      createdAt: '2026-05-11T16:00:00',
      replies: [],
    },
  ],
};
