import type {
  PostListResponse,
  PostDetail,
  CommentsResponse,
  SubjectItem,
} from '@/features/community/types';

/**
 * 커뮤니티 도메인 목 데이터 — 백엔드 응답 명세(노션 API 목록) 그대로.
 */

/** GET /api/subjects */
export const mockSubjects: SubjectItem[] = [
  { subjectId: 1, subjectName: '국어', courseCount: 24 },
  { subjectId: 2, subjectName: '수학', courseCount: 18 },
  { subjectId: 8, subjectName: '생명과학Ⅰ', courseCount: 5 },
];

/** GET /api/boards/{boardType}/posts */
export const mockPostListResponse: PostListResponse = {
  content: [
    {
      postId: 889,
      boardType: 'QUESTION',
      title: 'React Hook useEffect 사용 시 무한 루프 문제 해결 방법',
      authorName: '이*호',
      viewCount: 145,
      commentCount: 12,
      status: 'ADOPTED',
      currentCount: null,
      maxCount: null,
      createdAt: '2026-05-18T19:00:00',
    },
    {
      postId: 888,
      boardType: 'FREE',
      title: '수능 공부 팁 공유합니다',
      authorName: '박*영',
      viewCount: 321,
      commentCount: 3,
      status: null,
      currentCount: null,
      maxCount: null,
      createdAt: '2026-05-17T10:00:00',
    },
    {
      postId: 887,
      boardType: 'QUESTION',
      title: '미적분 극한 개념 질문',
      authorName: '이*윤',
      viewCount: 120,
      commentCount: 0,
      status: 'PENDING',
      currentCount: null,
      maxCount: null,
      createdAt: '2026-05-16T09:00:00',
    },
  ],
  totalPages: 3,
};

/** GET /api/posts/{postId} */
export const mockPostDetail: PostDetail = {
  postId: 889,
  boardType: 'QUESTION',
  title: 'React Hook useEffect 사용 시 무한 루프 문제 해결 방법',
  content:
    'useEffect 의존성 배열에 data를 넣었더니 무한 루프가 발생합니다. 어떻게 해결하나요?',
  authorName: '이*호',
  viewCount: 145,
  status: 'ADOPTED',
  isMine: false,
  fileUrls: ['https://s3.ap-northeast-2.amazonaws.com/image.png'],
  createdAt: '2026-05-18T19:00:00',
};

/** GET /api/posts/{postId}/comments */
export const mockCommentsResponse: CommentsResponse = {
  comments: [
    {
      commentId: 315,
      authorName: '박*준',
      content: '의존성 배열을 비우거나 다른 값으로 바꿔보세요.',
      imageUrl: null,
      isAccepted: true,
      isMine: false,
      createdAt: '2026-05-10T16:40:00',
      replies: [
        {
          commentId: 316,
          authorName: '김*민',
          content: '감사합니다! 해결됐어요.',
          imageUrl: null,
          isMine: true,
          createdAt: '2026-05-10T16:45:00',
        },
      ],
    },
    {
      commentId: 317,
      authorName: '최*수',
      content: 'useCallback도 좋은 방법입니다.',
      imageUrl: null,
      isAccepted: false,
      isMine: false,
      createdAt: '2026-05-10T17:00:00',
      replies: [],
    },
  ],
};
