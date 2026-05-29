export type BoardType = 'FREE' | 'QUESTION' | 'STUDY' | 'ALL';
export type PostStatus = 'PENDING' | 'ADOPTED';

// boardType → 화면 표시 레이블
export const BOARD_TYPE_LABEL: Record<Exclude<BoardType, 'ALL'>, string> = {
  FREE: '자유게시판',
  QUESTION: '질문게시판',
  STUDY: '스터디모집',
};

// 화면 표시 레이블 → boardType (글 작성/수정 폼용)
export const BOARD_TYPE_VALUE: Record<string, Exclude<BoardType, 'ALL'>> = {
  자유게시판: 'FREE',
  질문게시판: 'QUESTION',
  스터디모집: 'STUDY',
};

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  PENDING: '답변 대기',
  ADOPTED: '채택 완료',
};

// GET /api/boards/{boardType}/posts
export interface PostListItem {
  postId: number;
  boardType: Exclude<BoardType, 'ALL'>;
  title: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  status: PostStatus | null;
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
  status: PostStatus | null;
  fileUrls: string[];
  isMine: boolean;
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
  fileUrls?: string[];
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  fileUrls?: string[];
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
  parentCommentId?: number;
  imageUrl?: string;
}

export interface UpdateCommentRequest {
  content: string;
  imageUrl?: string;
}
