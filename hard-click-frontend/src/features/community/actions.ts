import {
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  acceptComment,
} from './services';
import type {
  BoardType,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
} from './types';

export async function getPostsAction(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string,
) {
  return getPosts(boardType, page, keyword, sort);
}

export async function getPostDetailAction(postId: number) {
  return getPostDetail(postId);
}

export async function createPostAction(body: CreatePostRequest) {
  return createPost(body);
}

export async function updatePostAction(
  postId: number,
  body: UpdatePostRequest,
) {
  return updatePost(postId, body);
}

export async function deletePostAction(postId: number) {
  return deletePost(postId);
}

export async function getCommentsAction(postId: number) {
  return getComments(postId);
}

export async function createCommentAction(body: CreateCommentRequest) {
  return createComment(body);
}

export async function updateCommentAction(
  commentId: number,
  body: UpdateCommentRequest,
) {
  return updateComment(commentId, body);
}

export async function deleteCommentAction(commentId: number) {
  return deleteComment(commentId);
}

export async function acceptCommentAction(commentId: number) {
  return acceptComment(commentId);
}
