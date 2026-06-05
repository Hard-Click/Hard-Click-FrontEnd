export type BoardType = 'FREE' | 'QUESTION' | 'ALL';

// boardType → 화면 표시 레이블
export const BOARD_TYPE_LABEL: Record<Exclude<BoardType, 'ALL'>, string> = {
  FREE: '자유게시판',
  QUESTION: '질문게시판',
};

// 화면 표시 레이블 → boardType (글 작성/수정 폼용)
export const BOARD_TYPE_VALUE: Record<string, Exclude<BoardType, 'ALL'>> = {
  자유게시판: 'FREE',
  질문게시판: 'QUESTION',
};

// GET /api/subjects
export interface SubjectItem {
  subjectId: number;
  subjectName: string;
  courseCount?: number;
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
