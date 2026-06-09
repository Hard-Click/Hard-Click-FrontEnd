export type BoardType = 'FREE' | 'QUESTION' | 'STUDY' | 'ALL';

export const BOARD_TYPE_LABEL: Record<Exclude<BoardType, 'ALL'>, string> = {
  FREE: '자유게시판',
  QUESTION: '질문게시판',
  STUDY: '스터디모집',
};

export const BOARD_TYPE_VALUE: Record<string, Exclude<BoardType, 'ALL'>> = {
  자유게시판: 'FREE',
  질문게시판: 'QUESTION',
  스터디게시판: 'STUDY',
};

export const TAB_TO_BOARD_TYPE: Record<string, BoardType> = {
  전체: 'ALL',
  자유게시판: 'FREE',
  질문게시판: 'QUESTION',
  스터디게시판: 'STUDY',
};

// GET /api/subjects → SubjectResponse { subjectId, subjectName }
export interface SubjectItem {
  subjectId: number;
  subjectName: string;
}

// GET /api/boards/{boardType}/posts
export interface PostListItem {
  postId: number;
  boardType: Exclude<BoardType, 'ALL'>;
  title: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  /** 질문글 한정: PENDING(답변대기)/ADOPTED(채택완료), 그 외 null */
  status?: 'PENDING' | 'ADOPTED' | null;
  /** 스터디 모집글 한정 (없으면 null) */
  currentCount?: number | null;
  maxCount?: number | null;
  createdAt: string;
}

export interface PostListResponse {
  content: PostListItem[];
  totalPages: number;
}

// GET /api/posts/{postId}
export interface PostDetail {
  postId: number;
  boardType: Exclude<BoardType, 'ALL'>;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  /** PENDING(답변대기) / ADOPTED(채택완료) */
  status: 'PENDING' | 'ADOPTED';
  isMine: boolean;
  fileUrls: string[];
  createdAt: string;
}

// GET /api/posts/{postId}/comments
export interface ReplyItem {
  commentId: number;
  authorName: string;
  content: string;
  imageUrl: string | null;
  isMine: boolean;
  createdAt: string;
}

export interface CommentItem {
  commentId: number;
  authorName: string;
  content: string;
  imageUrl: string | null;
  isAccepted: boolean;
  isMine: boolean;
  createdAt: string;
  replies: ReplyItem[];
}

export interface CommentsResponse {
  comments: CommentItem[];
}

// Request bodies
export interface CreatePostRequest {
  boardType: Exclude<BoardType, 'ALL'>;
  title: string;
  content: string;
  subjectId?: number;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  subjectId?: number;
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
  parentId?: number;
}

export interface UpdateCommentRequest {
  content: string;
}

/* ───── 백엔드 응답 (실제 Hard-Click-BackEnd 코드 DTO) ─────
 * 서비스의 toXxx 매퍼가 이 API 타입 → 위의 UI 타입으로 변환한다. */

// GET /api/boards/{boardType}/posts → PostListResponse
export interface PostItemApiResponse {
  postId: number;
  boardType: Exclude<BoardType, 'ALL'>;
  title: string;
  authorName: string;
  createdAt: string;
  viewCount: number;
  commentCount: number;
}

export interface PostListApiResponse {
  posts: PostItemApiResponse[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// GET /api/posts/{postId} → PostDetailResponse
export interface PostDetailApiResponse {
  postId: number;
  boardType: Exclude<BoardType, 'ALL'>;
  title: string;
  authorName: string;
  createdAt: string;
  viewCount: number;
  content: string;
  isMyPost: boolean;
  isAccepted: boolean;
  fileUrls: string[];
}

// GET /api/posts/{postId}/comments → CommentListResponse (replies는 재귀 동일 타입)
export interface CommentApiItem {
  commentId: number;
  authorName: string;
  authorInitial: string;
  content: string;
  createdAt: string;
  isAccepted: boolean;
  isMine: boolean;
  isDeleted: boolean;
  imageUrl: string | null;
  replies: CommentApiItem[];
}

export interface CommentListApiResponse {
  totalCount: number;
  comments: CommentApiItem[];
}
