import { serverApi as api } from '@/lib/api';
import type { ApiResponse } from '@/services/api';
import { subjectLabel } from '@/features/courses/subjects';
import type {
  BoardType,
  PostListResponse,
  PostListItem,
  PostDetail,
  CommentsResponse,
  CommentItem,
  ReplyItem,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  SubjectItem,
  PostItemApiResponse,
  PostListApiResponse,
  PostDetailApiResponse,
  CommentApiItem,
  CommentListApiResponse,
} from './types';
// 커뮤니티 도메인만 실서버 연동 (다른 도메인은 전역 USE_MOCK 유지)
import { USE_MOCK_COMMUNITY as USE_MOCK } from '@/mocks/config';
import {
  mockPostListResponse,
  mockPostDetail,
  mockPostDetailsById,
  mockCommentsResponse,
  mockSubjects,
} from '@/mocks/community.mock';

function mockOk<T>(data: T): ApiResponse<T> {
  return { success: true, httpStatus: 200, message: '', data };
}

/** ApiResponse<A> → ApiResponse<B> (성공+데이터만 매핑, 에러는 그대로 전파) */
export function mapOk<A, B>(
  res: ApiResponse<A>,
  fn: (a: A) => B
): ApiResponse<B> {
  if (res.success && res.data != null) return { ...res, data: fn(res.data) };
  return { ...res, data: undefined } as ApiResponse<B>;
}

/* ───── 백엔드 응답(API) → UI 타입 매퍼 ───── */
function toPostListItem(p: PostItemApiResponse): PostListItem {
  return {
    // 스터디는 postId가 null이라 groupId로 대체 (StudyPostCard 링크용)
    postId: p.postId ?? p.groupId ?? 0,
    groupId: p.groupId ?? null,
    boardType: p.boardType,
    title: p.title,
    authorName: p.authorName,
    viewCount: p.viewCount ?? 0,
    commentCount: p.commentCount ?? 0,
    status: p.status ?? null,
    currentCount: p.currentCount ?? null,
    maxCount: p.maxCount ?? null,
    subjectName: p.subjectName ?? null,
    description: p.description ?? null,
    createdAt: p.createdAt,
    isMine: p.isMine ?? null,
    isJoined: p.isJoined ?? null,
    isClosed: p.isClosed ?? null,
  };
}

export function toPostListResponse(r: PostListApiResponse): PostListResponse {
  // 전체(ALL)는 `items`, per-board는 `posts` — 둘 중 존재하는 배열을 사용
  const list = r.posts ?? r.items ?? [];
  return { content: list.map(toPostListItem), totalPages: r.totalPages };
}

function toPostDetail(d: PostDetailApiResponse): PostDetail {
  return {
    postId: d.postId,
    boardType: d.boardType,
    subjectName: d.subjectName ?? null,
    title: d.title,
    content: d.content,
    authorName: d.authorName,
    viewCount: d.viewCount,
    status: d.isAccepted ? 'ADOPTED' : 'PENDING',
    isMine: d.isMyPost,
    fileUrls: d.fileUrls,
    createdAt: d.createdAt,
  };
}

function toReply(c: CommentApiItem): ReplyItem {
  return {
    commentId: c.commentId,
    authorName: c.authorName,
    content: c.content,
    imageUrl: c.imageUrl,
    isMine: c.isMine,
    isDeleted: c.isDeleted,
    createdAt: c.createdAt,
  };
}

function toComment(c: CommentApiItem): CommentItem {
  return {
    commentId: c.commentId,
    authorName: c.authorName,
    content: c.content,
    imageUrl: c.imageUrl,
    isAccepted: c.isAccepted,
    isMine: c.isMine,
    isDeleted: c.isDeleted,
    createdAt: c.createdAt,
    replies: c.replies.map(toReply),
  };
}

function toCommentsResponse(r: CommentListApiResponse): CommentsResponse {
  return { comments: r.comments.map(toComment) };
}

export async function createComment(body: CreateCommentRequest, image?: File) {
  if (USE_MOCK) return mockOk({ commentId: 1 });
  const form = new FormData();
  form.append(
    'data',
    new Blob([JSON.stringify(body)], { type: 'application/json' })
  );
  // 백엔드 댓글 이미지 multipart 필드명은 `file` (게시글은 `files`)
  if (image) form.append('file', image);
  return api.post<{ commentId: number }>('/api/comments', form);
}

export async function getPosts(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string
) {
  if (USE_MOCK) return mockOk(toPostListResponse(mockPostListResponse));

  const params = new URLSearchParams();
  params.set('page', String(page));
  if (keyword) params.set('keyword', keyword);
  if (sort) params.set('sort', sort);

  const url =
    boardType === 'ALL'
      ? `/api/boards/posts?${params.toString()}`
      : `/api/boards/${boardType}/posts?${params.toString()}`;

  return mapOk(await api.get<PostListApiResponse>(url), toPostListResponse);
}

interface SubjectApiItem {
  subjectId: number;
  subjectName: string;
}

export async function getSubjects(): Promise<ApiResponse<SubjectItem[]>> {
  if (USE_MOCK) return mockOk(mockSubjects);
  const res = await api.get<SubjectApiItem[]>('/api/subjects');
  if (!res.success || !res.data) return { ...res, data: [] };
  return {
    ...res,
    data: res.data.map((item) => ({
      code: item.subjectName,
      name: subjectLabel(item.subjectName),
    })),
  };
}

export async function getPostDetail(postId: number) {
  if (USE_MOCK) {
    // 게시글별 상세(테스트용 여러 글) 우선. 없으면 목록 항목에 맞춰 기본 글 노출.
    // isMine 없는 항목(질문/자유 게시판)은 남의 글로 간주 → 신고 테스트 가능.
    const li = (
      mockPostListResponse.posts ??
      mockPostListResponse.items ??
      []
    ).find((p) => p.postId === postId || (p.groupId ?? null) === postId);
    const detail = mockPostDetailsById[postId] ?? {
      ...mockPostDetail,
      postId,
      title: li?.title ?? mockPostDetail.title,
      authorName: li?.authorName ?? mockPostDetail.authorName,
      isMyPost: li?.isMine ?? false,
    };
    return mockOk(toPostDetail(detail));
  }
  return mapOk(
    await api.get<PostDetailApiResponse>(`/api/posts/${postId}`),
    toPostDetail
  );
}

export async function createPost(body: CreatePostRequest, files?: File[]) {
  if (USE_MOCK) return mockOk({ postId: 1 });
  const form = new FormData();
  form.append(
    'data',
    new Blob([JSON.stringify(body)], { type: 'application/json' })
  );
  if (files) files.forEach((f) => form.append('files', f));
  return api.post<{ postId: number }>('/api/posts', form);
}

export async function updatePost(
  postId: number,
  body: UpdatePostRequest,
  files?: File[]
) {
  if (USE_MOCK) return mockOk({ postId });
  const form = new FormData();
  form.append(
    'data',
    new Blob([JSON.stringify(body)], { type: 'application/json' })
  );
  if (files) files.forEach((f) => form.append('files', f));
  return api.patch<{ postId: number }>(`/api/posts/${postId}`, form);
}

export async function deletePost(postId: number) {
  if (USE_MOCK) return mockOk<void>(undefined as void);
  return api.delete<void>(`/api/posts/${postId}`);
}

export async function getComments(postId: number) {
  if (USE_MOCK) return mockOk(toCommentsResponse(mockCommentsResponse));
  return mapOk(
    await api.get<CommentListApiResponse>(`/api/posts/${postId}/comments`),
    toCommentsResponse
  );
}

export async function updateComment(
  commentId: number,
  body: UpdateCommentRequest
) {
  if (USE_MOCK) return mockOk({ commentId });
  const form = new FormData();
  form.append(
    'data',
    new Blob([JSON.stringify(body)], { type: 'application/json' })
  );
  return api.patch<{ commentId: number }>(`/api/comments/${commentId}`, form);
}

export async function deleteComment(commentId: number) {
  if (USE_MOCK) return mockOk<void>(undefined as void);
  return api.delete<void>(`/api/comments/${commentId}`);
}

export async function acceptComment(commentId: number) {
  if (USE_MOCK) return mockOk({ isAccepted: true });
  return api.post<{ isAccepted: boolean }>(
    `/api/comments/${commentId}/accept`,
    {}
  );
}
