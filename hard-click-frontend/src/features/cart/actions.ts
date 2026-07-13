'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { mockCart } from '@/mocks/cart.mock';

/** 장바구니 삭제 결과 */
export interface CartActionResult {
  success: boolean;
  message: string;
}

/**
 * 장바구니 항목 삭제 (Server Action) — 개별/전체 공용(cartItemIds).
 * 라이브: DELETE /api/cart/{courseId} 병렬 호출 — 404(이미 없음)는 멱등 성공으로 처리하고
 *   부분 실패에도 항상 revalidate. mock: 존재 항목 확인 후 성공.
 */
export async function removeCartItemsAction(
  cartItemIds: number[],
): Promise<CartActionResult> {
  if (cartItemIds.length === 0) {
    return { success: false, message: '삭제할 항목이 없습니다.' };
  }

  if (isMock('cart')) {
    const exists = cartItemIds.every((id) =>
      mockCart.items.some((it) => it.cartItemId === id),
    );
    if (!exists) {
      return { success: false, message: '장바구니 항목을 찾을 수 없습니다.' };
    }
    // 삭제 처리중 UX 노출용 지연(mock). 연동 시 실제 DELETE 응답으로 대체.
    await new Promise((resolve) => setTimeout(resolve, 500));
    // mock 상태 실제 갱신(연동 시 BE가 처리) → revalidate·새로고침에도 반영
    const removeSet = new Set(cartItemIds);
    mockCart.items = mockCart.items.filter(
      (it) => !removeSet.has(it.cartItemId),
    );
    mockCart.totalCount = mockCart.items.length;
    mockCart.totalPrice = mockCart.items.reduce((sum, it) => sum + it.price, 0);
    revalidatePath('/cart');
    return { success: true, message: '장바구니가 삭제되었습니다.' };
  }

  // 라이브: BE는 courseId로 삭제(식별자=courseId) → DELETE /api/cart/{courseId} 병렬 호출
  const results = await Promise.all(
    cartItemIds.map((id) => serverApi.delete(`/api/cart/${id}`)),
  );
  // 404(CART_ITEM_NOT_FOUND)=이미 없음 → 삭제 목적은 이미 달성(멱등). 그 외 실패만 진짜 실패로 본다.
  const hardFailed = results.some((r) => !r.success && r.httpStatus !== 404);
  // 성공/실패 무관하게 항상 재검증 — 부분 성공 시 실제로 삭제된 항목이 화면에 stale하게
  // 남던 버그 방지(예전엔 하나라도 실패하면 revalidate 없이 통째로 실패 반환).
  revalidatePath('/cart');
  if (hardFailed) {
    return {
      success: false,
      message: '일부 항목을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.',
    };
  }
  return { success: true, message: '장바구니가 삭제되었습니다.' };
}
