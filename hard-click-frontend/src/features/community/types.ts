export type BoardType = 'FREE' | 'QUESTION' | 'STUDY' | 'ALL';

export const BOARD_TYPE_LABEL: Record<Exclude<BoardType, 'ALL'>, string> = {
  FREE: '자유게시판',
  QUESTION: '질문게시판',
  STUDY: '스터디모집',
};

export const BOARD_TYPE_VALUE: Record<string, Exclude<BoardType, 'ALL'>> = {
  자유게시판: 'FREE',
  질문게시판: 'QUESTION',
  스터디모집: 'STUDY',
};

export const TAB_TO_BOARD_TYPE: Record<string, BoardType> = {
  전체: 'ALL',
  자유게시판: 'FREE',
  질문게시판: 'QUESTION',
  스터디모집: 'STUDY',
};

// GET /api/subjects → enum 기반
export interface SubjectItem {
  code: string;
  name: string;
}

// GET /api/boards/{boardType}/posts
export interface PostListItem {
  postId: number; // 스터디 모집글은 백엔드 postId가 null이라 매퍼에서 groupId로 채움
  groupId?: number | null;
  boardType: Exclude<BoardType, 'ALL'>;
  title: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  isClosed?: boolean | null;
  /** 질문글 한정: PENDING(답변대기)/ADOPTED(채택완료), 그 외 null */
  status?: 'PENDING' | 'ADOPTED' | null;
  /** 스터디 모집글 한정 (없으면 null) */
  currentCount?: number | null;
  maxCount?: number | null;
  createdAt: string;
  subjectName?: string | null;
  description?: string | null;
  isMine?: boolean | null;
  isJoined?: boolean | null;
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
  subjectName?: string | null;
  /** BE raw enum 코드 (예: 'KO_READING') — 수정 폼에서 드롭다운 초기값으로 사용 */
  subjectCode?: string | null;
}

// GET /api/posts/{postId}/comments
export interface ReplyItem {
  commentId: number;
  authorName: string;
  content: string;
  imageUrl: string | null;
  isMine: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface CommentItem {
  commentId: number;
  authorName: string;
  content: string;
  imageUrl: string | null;
  isAccepted: boolean;
  isMine: boolean;
  isDeleted: boolean;
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
  subject?: string; // 백엔드는 과목 enum 코드(예: MATH_1)로 받음
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  subject?: string; // 백엔드는 과목 enum 코드(예: MATH_1)로 받음
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
  parentId?: number;
}

export interface UpdateCommentRequest {
  content: string;
  /** 수정 전 댓글이 갖고 있던 이미지 URL — 있으면 서버 액션이 이 URL을 다시 받아와 파일로 재첨부해
   *  기존 이미지를 유지한다(FE 전용 필드, 백엔드로는 전달 안 됨). 댓글 수정 UI엔 이미지 교체 기능이
   *  없으므로 텍스트만 바꿔도 기존 이미지가 사라지지 않게 하는 최소 보정. */
  keepImageUrl?: string;
}

/* ───── 백엔드 응답 (실제 Hard-Click-BackEnd 코드 DTO) ─────
 * 서비스의 toXxx 매퍼가 이 API 타입 → 위의 UI 타입으로 변환한다. */

// 게시판 목록 항목.
// - per-board(`/api/boards/{type}/posts`): `posts[]`
// - 전체(`/api/boards/posts`): `items[]` — 스터디(STUDY) 포함 피드. STUDY는 postId=null, groupId로 식별
export interface PostItemApiResponse {
  type?: 'POST' | 'STUDY';
  postId: number | null;
  groupId?: number | null;
  boardType: Exclude<BoardType, 'ALL'>;
  title: string;
  authorName: string;
  createdAt: string;
  viewCount: number | null;
  commentCount: number | null;
  /** 한국어 과목명 (예: '독서') — BE가 name으로 내려줄 때 */
  subjectName?: string | null;
  /** 과목 enum 코드 (예: 'KO_READING') — BE가 code로 내려줄 때 */
  subject?: string | null;
  description?: string | null;
  currentCount?: number | null;
  maxCount?: number | null;
  status?: 'PENDING' | 'ADOPTED' | null;
  /** 질문글 채택 여부 — 목록 응답은 status가 아니라 이 필드로 내려온다(라이브 확인). */
  isAccepted?: boolean | null;
  isMine?: boolean | null;
  isJoined?: boolean | null;
  isClosed?: boolean | null;
}

export interface PostListApiResponse {
  posts?: PostItemApiResponse[]; // per-board
  items?: PostItemApiResponse[]; // 전체(ALL) 피드
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// GET /api/study → StudyPageResponse (스터디는 게시판과 별도 리소스)
export interface StudyItemApiResponse {
  groupId: number;
  title: string;
  content: string;
  authorName: string;
  subjectName?: string | null;
  currentCount: number;
  maxCount: number;
  isClosed: boolean;
  // 목록에도 참여 여부 제공(BE 2026-07-18 추가) → 카드 라벨('입장하기' vs '참여하기') 정확화.
  isMine: boolean;
  isJoined: boolean;
  createdAt: string;
}

export interface StudyListApiResponse {
  content: StudyItemApiResponse[];
  totalPages: number;
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
  /** 한국어 과목명 (예: '독서') — BE가 name으로 내려줄 때 */
  subjectName?: string | null;
  /** 과목 enum 코드 (예: 'KO_READING') — BE가 code로 내려줄 때 */
  subject?: string | null;
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
