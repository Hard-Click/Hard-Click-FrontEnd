'use server';

import { revalidatePath } from 'next/cache';
import { USE_MOCK } from '@/mocks/config';
import { mockCart } from '@/mocks/cart.mock';

/** 장바구니 삭제 결과 */
export interface CartActionResult {
  success: boolean;
  message: string;
}

/**
 * 장바구니 항목 삭제 (Server Action) — 개별/전체 공용(cartItemIds).
 * mock: 존재하는 항목인지 확인 후 성공. 연동 시 DELETE /api/cart/{id}로 교체.
 */
export async function removeCartItemsAction(
  cartItemIds: number[],
): Promise<CartActionResult> {
  if (cartItemIds.length === 0) {
    return { success: false, message: '삭제할 항목이 없습니다.' };
  }

  if (USE_MOCK) {
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

  // TODO(API 연동): DELETE /api/cart/{cartItemId} 반복 호출 후 revalidatePath('/cart')
  return {
    success: false,
    message: '삭제에 실패했어요. 잠시 후 다시 시도해주세요.',
  };
}
