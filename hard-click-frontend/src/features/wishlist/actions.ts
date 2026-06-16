'use server';

import { revalidatePath } from 'next/cache';
import { USE_MOCK } from '@/mocks/config';
import { mockWishlist } from '@/mocks/wishlist.mock';

/** 찜 동작 결과 */
export interface WishlistActionResult {
  success: boolean;
  message: string;
}

/** 찜 추가 입력 (강의 상세에서 전달 — WishlistApiItem 구성에 필요한 최소 정보) */
export interface AddWishlistInput {
  courseId: number;
  title: string;
  instructorName: string;
  subjectName: string;
  price: number;
  isFree: boolean;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  thumbnailUrl?: string;
  isEnrolled: boolean;
  isInCart: boolean;
}

/**
 * 찜 추가 (Server Action) — 강의 상세의 하트로 위시리스트에 담는다.
 * mock: 중복(courseId) 방지 후 추가. 연동 시 POST /api/wishlist로 교체.
 */
export async function addWishlistAction(
  input: AddWishlistInput,
): Promise<WishlistActionResult> {
  if (!Number.isInteger(input.courseId) || input.courseId <= 0) {
    return { success: false, message: '잘못된 강의입니다.' };
  }

  if (USE_MOCK) {
    const already = mockWishlist.items.some(
      (it) => it.courseId === input.courseId,
    );
    if (!already) {
      mockWishlist.items.push({
        courseId: input.courseId,
        title: input.title,
        instructorName: input.instructorName,
        subjectName: input.subjectName,
        price: input.price,
        priceType: input.isFree ? 'FREE' : 'PAID',
        averageRating: input.averageRating,
        reviewCount: input.reviewCount,
        studentCount: input.studentCount,
        thumbnailUrl: input.thumbnailUrl ?? '',
        isEnrolled: input.isEnrolled,
        isInCart: input.isInCart,
      });
      mockWishlist.totalCount = mockWishlist.items.length;
    }
    revalidatePath('/mypage/wishlist');
    return { success: true, message: '찜 목록에 추가되었습니다.' };
  }

  // TODO(API 연동): POST /api/wishlist { courseId } 후 revalidatePath('/mypage/wishlist')
  return {
    success: false,
    message: '찜에 실패했어요. 잠시 후 다시 시도해주세요.',
  };
}

/**
 * 찜 해제 (Server Action) — 위시리스트에서 강의 제거.
 * mock: 존재 확인 후 실제 갱신(revalidate·새로고침에도 반영). 연동 시 DELETE /api/wishlist/{courseId}로 교체.
 */
export async function removeWishlistAction(
  courseId: number,
): Promise<WishlistActionResult> {
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return { success: false, message: '잘못된 강의입니다.' };
  }

  if (USE_MOCK) {
    const exists = mockWishlist.items.some((it) => it.courseId === courseId);
    if (!exists) {
      return { success: false, message: '찜한 강의를 찾을 수 없습니다.' };
    }
    mockWishlist.items = mockWishlist.items.filter(
      (it) => it.courseId !== courseId,
    );
    mockWishlist.totalCount = mockWishlist.items.length;
    revalidatePath('/mypage/wishlist');
    return { success: true, message: '찜한 강의에서 삭제되었습니다.' };
  }

  // TODO(API 연동): DELETE /api/wishlist/{courseId} 후 revalidatePath('/mypage/wishlist')
  return {
    success: false,
    message: '삭제에 실패했어요. 잠시 후 다시 시도해주세요.',
  };
}
