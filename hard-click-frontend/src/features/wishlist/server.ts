import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { subjectLabel } from '@/features/courses/subjects';
import {
  mockWishlist,
  type WishlistApiItem,
} from '@/mocks/wishlist.mock';
import type { WishlistCourse } from './types';

/** mock(WishlistApiItem) → UI 계약 매퍼(격리막) */
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

/** 실서버 GET /api/wishlist 응답(BE `WishlistResponse`) — 격리막.
 *  ⚠️ BE가 풍부한 항목을 줌(2026-06-24 재배포 검증): 썸네일·과목·평점·수강생수·priceType·찜/담김 여부. */
interface BeWishlistResponse {
  items: {
    courseId: number;
    title: string;
    subject: string; // BE enum(MATH_1 등) → subjectLabel로 한글화
    thumbnailUrl: string;
    priceType: string; // 'FREE' | 'PAID'
    instructorName: string;
    price: number;
    averageRating: number;
    reviewCount: number;
    enrollmentCount: number;
    enrolled: boolean;
    inCart: boolean;
  }[];
  totalCount: number;
}

/** BE 응답 → UI 매퍼. 과목은 courses의 subjectLabel로 한글화(목록 카드와 동일). */
function toWishlistFromApi(
  item: BeWishlistResponse['items'][number],
): WishlistCourse {
  return {
    courseId: item.courseId,
    title: item.title,
    instructorName: item.instructorName,
    subjectName: subjectLabel(item.subject),
    price: item.price,
    isFree: item.priceType === 'FREE',
    averageRating: item.averageRating,
    reviewCount: item.reviewCount,
    studentCount: item.enrollmentCount,
    thumbnailUrl: item.thumbnailUrl || undefined,
    isEnrolled: item.enrolled,
    isInCart: item.inCart,
  };
}

/**
 * 찜한 강의 목록 조회 (Server Component 전용).
 * BE `GET /api/wishlist` 구현됨(레포 origin/develop) — 라이브 서버 배포 후 config `wishlist:false`로 전환.
 * 실패는 빈 목록으로 숨기지 않고 전파 → error.tsx에서 처리.
 */
export async function getWishlistServer(): Promise<WishlistCourse[]> {
  if (isMock('wishlist')) {
    return mockWishlist.items.map(toWishlistCourse);
  }

  const res = await serverApi.get<BeWishlistResponse>('/api/wishlist');
  if (!res.success || !res.data) {
    throw new Error('찜한 강의를 불러오지 못했습니다.');
  }
  return res.data.items.map(toWishlistFromApi);
}
