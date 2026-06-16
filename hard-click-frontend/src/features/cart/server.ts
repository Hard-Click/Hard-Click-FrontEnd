import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import {
  mockCart,
  type CartApiResponse,
  type CartItemApiItem,
} from '@/mocks/cart.mock';
import type { Cart, CartItem } from './types';

/** BE 항목 → UI 계약 매퍼(격리막) */
function toCartItem(api: CartItemApiItem): CartItem {
  return {
    cartItemId: api.cartItemId,
    courseId: api.courseId,
    title: api.courseTitle,
    instructor: api.instructorName,
    price: api.price,
    thumbnailUrl: api.thumbnailUrl,
  };
}

function toCart(api: CartApiResponse): Cart {
  return {
    items: api.items.map(toCartItem),
    totalPrice: api.totalPrice,
    totalCount: api.totalCount,
  };
}

/**
 * 내 장바구니 조회 (Server Component 전용).
 * BE 미구현(노션 명세) → USE_MOCK. 연동 시 엔드포인트/매퍼만 맞추면 됨.
 */
export async function getCartServer(): Promise<Cart> {
  if (USE_MOCK) {
    return toCart(mockCart);
  }

  // TODO(API 연동): GET /api/cart (CartApiResponse).
  // 실패는 빈 장바구니로 숨기지 않고 전파 → error.tsx에서 에러/빈상태 구분 처리.
  const res = await serverApi.get<CartApiResponse>('/api/cart');
  if (!res.success || !res.data) {
    throw new Error('장바구니를 불러오지 못했습니다.');
  }
  return toCart(res.data);
}
