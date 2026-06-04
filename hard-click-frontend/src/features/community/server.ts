import { serverApi } from '@/lib/api';
import type { BoardType, PostListResponse } from './types';

/**
 * 커뮤니티 게시글 목록 — **서버에서 직접 호출**(Server Component 전용).
 *
 * 기존 `services.ts`의 getPosts는 클라이언트 axios(localStorage 토큰)를 쓰지만,
 * 이 함수는 서버 axios(쿠키)를 써서 페이지가 서버에서 데이터를 확보한 채 렌더된다.
 * 목록 조회는 공개 API라 토큰 없이도 동작한다.
 */
export async function getCommunityPosts(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string,
) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (keyword) params.set('keyword', keyword);
  if (sort) params.set('sort', sort);

  const url =
    boardType === 'ALL'
      ? `/api/boards/posts?${params.toString()}`
      : `/api/boards/${boardType}/posts?${params.toString()}`;

  return serverApi.get<PostListResponse>(url);
}
