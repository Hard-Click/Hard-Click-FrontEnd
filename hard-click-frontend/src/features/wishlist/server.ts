import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import {
  mockWishlist,
  type WishlistApiResponse,
  type WishlistApiItem,
} from '@/mocks/wishlist.mock';
import type { WishlistCourse } from './types';

/** BE 찜 항목 → UI 계약 매퍼(격리막) */
function toWishlistCourse(api: WishlistApiItem): WishlistCourse {
  return {
    courseId: api.courseId,
    title: api.title,
    instructorName: api.instructorName,
    subjectName: api.subjectName,
    price: api.price,
    isFree: api.priceType === 'FREE',
    averageRating: api.averageRating,
    reviewCount: api.reviewCount,
    studentCount: api.studentCount,
    thumbnailUrl: api.thumbnailUrl || undefined,
    isEnrolled: api.isEnrolled,
    isInCart: api.isInCart,
  };
}

/**
 * 찜한 강의 목록 조회 (Server Component 전용).
 * 찜 API는 BE 미구현 → USE_MOCK. 연동 시 엔드포인트/매퍼만 맞추면 됨.
 */
export async function getWishlistServer(): Promise<WishlistCourse[]> {
  if (USE_MOCK) {
    return mockWishlist.items.map(toWishlistCourse);
  }

  // TODO(API 연동): GET /api/wishlist (찜 목록) — 현재 명세 없음.
  // 실패는 빈 목록으로 숨기지 않고 전파 → error.tsx에서 처리.
  const res = await serverApi.get<WishlistApiResponse>('/api/wishlist');
  if (!res.success || !res.data) {
    throw new Error('찜한 강의를 불러오지 못했습니다.');
  }
  return res.data.items.map(toWishlistCourse);
}
