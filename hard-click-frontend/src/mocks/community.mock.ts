import type {
  PostListApiResponse,
  PostDetailApiResponse,
  CommentListApiResponse,
  SubjectItem,
} from '@/features/community/types';

import { SUBJECTS } from '@/constants/subjects';

/**
 * 커뮤니티 도메인 목 데이터 — 실제 백엔드 코드(community) DTO 기준.
 * 서비스의 toXxx 매퍼가 이 백엔드 shape → UI 타입으로 변환한다.
 *
 * ⚠️ 노션 명세(content 래퍼, status PENDING/ADOPTED, isMine)와 다름:
 *    실제는 posts 래퍼 + isMyPost/isAccepted, 댓글은 authorInitial/isDeleted 포함 재귀.
 */

export const mockSubjects: SubjectItem[] = SUBJECTS.map((s) => ({
  code: s.code,
  name: s.name,
}));

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
      subjectName: '독서',
      status: 'ADOPTED',
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
      subjectName: '미적분',
      status: 'PENDING',
    },
    {
      postId: 886,
      boardType: 'STUDY',
      title: '알고리즘 스터디 모집합니다 (주 2회)',
      authorName: '김*준',
      createdAt: '2026-05-15T14:00:00',
      viewCount: 89,
      commentCount: 5,
      subjectName: '수학Ⅰ',
      description: '함께 공부하실 분을 찾습니다',
      currentCount: 3,
      maxCount: 6,
      isMine: true,
      isJoined: false,
    },
    {
      postId: 885,
      boardType: 'STUDY',
      title: '한국사 스터디 팀원 모집',
      authorName: '이*지',
      createdAt: '2026-05-14T11:00:00',
      viewCount: 54,
      commentCount: 2,
      subjectName: '한국사',
      description: '모집이 마감되었습니다',
      currentCount: 5,
      maxCount: 5,
      isMine: false,
      isJoined: false,
    },
    {
      postId: 884,
      boardType: 'STUDY',
      title: '영어 회화 스터디',
      authorName: '박*수',
      createdAt: '2026-05-13T10:00:00',
      viewCount: 30,
      commentCount: 1,
      subjectName: '영어Ⅰ',
      description: '함께 공부하실 분을 찾습니다',
      currentCount: 4,
      maxCount: 6,
      isMine: false,
      isJoined: true,
    },
    {
      postId: 883,
      boardType: 'STUDY',
      title: '과학 실험 스터디원 모집',
      authorName: '정*우',
      createdAt: '2026-05-12T09:00:00',
      viewCount: 42,
      commentCount: 0,
      subjectName: '물리학Ⅰ',
      description: '함께 공부하실 분을 찾습니다',
      currentCount: 2,
      maxCount: 4,
      isMine: false,
      isJoined: false,
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
  subjectName: '독서',
  content:
    'useEffect 의존성 배열에 data를 넣었더니 무한 루프가 발생합니다. 어떻게 해결하나요?',
  isMyPost: true,
  isAccepted: true,
  fileUrls: [
    'https://picsum.photos/id/24/800/600',
    'https://picsum.photos/id/180/800/600',
  ],
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
