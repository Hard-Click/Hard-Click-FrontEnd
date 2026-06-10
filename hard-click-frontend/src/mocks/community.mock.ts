import type {
  PostListApiResponse,
  PostDetailApiResponse,
  CommentListApiResponse,
  SubjectItem,
} from '@/features/community/types';

/**
 * 커뮤니티 도메인 목 데이터 — 실제 백엔드 코드(community) DTO 기준.
 * 서비스의 toXxx 매퍼가 이 백엔드 shape → UI 타입으로 변환한다.
 *
 * ⚠️ 노션 명세(content 래퍼, status PENDING/ADOPTED, isMine)와 다름:
 *    실제는 posts 래퍼 + isMyPost/isAccepted, 댓글은 authorInitial/isDeleted 포함 재귀.
 */

/** GET /api/subjects → SubjectResponse[] */
export const mockSubjects: SubjectItem[] = [
  { subjectId: 1, subjectName: '국어' },
  { subjectId: 2, subjectName: '수학' },
  { subjectId: 8, subjectName: '생명과학Ⅰ' },
];

/** GET /api/boards/{boardType}/posts → PostListResponse */
export const mockPostListResponse: PostListApiResponse = {
  posts: [
    {
      postId: 889,
      boardType: 'QUESTION',
      title: 'React Hook useEffect 사용 시 무한 루프 문제 해결 방법',
      authorName: '이*호',
      createdAt: '2026-05-18T19:00:00',
      viewCount: 145,
      commentCount: 12,
    },
    {
      postId: 888,
      boardType: 'FREE',
      title: '수능 공부 팁 공유합니다',
      authorName: '박*영',
      createdAt: '2026-05-17T10:00:00',
      viewCount: 321,
      commentCount: 3,
    },
    {
      postId: 887,
      boardType: 'QUESTION',
      title: '미적분 극한 개념 질문',
      authorName: '이*윤',
      createdAt: '2026-05-16T09:00:00',
      viewCount: 120,
      commentCount: 0,
    },
    {
      postId: 886,
      boardType: 'STUDY',
      title: '알고리즘 스터디 모집합니다 (주 2회)',
      authorName: '김*준',
      createdAt: '2026-05-15T14:00:00',
      viewCount: 89,
      commentCount: 5,
    },
  ],
  currentPage: 0,
  totalPages: 3,
  totalCount: 27,
};

/** GET /api/posts/{postId} → PostDetailResponse */
export const mockPostDetail: PostDetailApiResponse = {
  postId: 889,
  boardType: 'QUESTION',
  title: 'React Hook useEffect 사용 시 무한 루프 문제 해결 방법',
  authorName: '이*호',
  createdAt: '2026-05-18T19:00:00',
  viewCount: 145,
  content:
    'useEffect 의존성 배열에 data를 넣었더니 무한 루프가 발생합니다. 어떻게 해결하나요?',
  isMyPost: false,
  isAccepted: true,
  fileUrls: ['https://s3.ap-northeast-2.amazonaws.com/image.png'],
};

/** GET /api/posts/{postId}/comments → CommentListResponse */
export const mockCommentsResponse: CommentListApiResponse = {
  totalCount: 2,
  comments: [
    {
      commentId: 315,
      authorName: '박*준',
      authorInitial: '박',
      content: '의존성 배열을 비우거나 다른 값으로 바꿔보세요.',
      createdAt: '2026-05-10T16:40:00',
      isAccepted: true,
      isMine: false,
      isDeleted: false,
      imageUrl: null,
      replies: [
        {
          commentId: 316,
          authorName: '김*민',
          authorInitial: '김',
          content: '감사합니다! 해결됐어요.',
          createdAt: '2026-05-10T16:45:00',
          isAccepted: false,
          isMine: true,
          isDeleted: false,
          imageUrl: null,
          replies: [],
        },
      ],
    },
    {
      commentId: 317,
      authorName: '최*수',
      authorInitial: '최',
      content: 'useCallback도 좋은 방법입니다.',
      createdAt: '2026-05-10T17:00:00',
      isAccepted: false,
      isMine: false,
      isDeleted: false,
      imageUrl: null,
      replies: [],
    },
  ],
};
