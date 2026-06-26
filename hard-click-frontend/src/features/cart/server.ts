import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import {
  mockCart,
  type CartApiResponse,
  type CartItemApiItem,
} from '@/mocks/cart.mock';
import type { Cart, CartItem } from './types';

/** mock(CartApiResponse) 항목 → UI 계약 매퍼(격리막) */
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

/** 실서버 GET /api/cart 응답(BE `CartResponse`) — 격리막 */
interface BeCartResponse {
  items: {
    courseId: number;
    title: string;
    instructorName: string;
    price: number;
  }[];
  selectedCount: number;
  totalAmount: number;
}

/**
 * BE 응답 → UI 매퍼. ⚠️ BE는 cartItemId가 없고 **courseId로 삭제**(`DELETE /api/cart/{courseId}`)
 * → 식별자(cartItemId)를 courseId로 둔다. 썸네일은 BE 미제공이라 빈 값(연동 확장 시 추가).
 */
function toCartFromApi(api: BeCartResponse): Cart {
  return {
    items: api.items.map((i) => ({
      cartItemId: i.courseId,
      courseId: i.courseId,
      title: i.title,
      instructor: i.instructorName,
      price: i.price,
      thumbnailUrl: '',
    })),
    totalPrice: api.totalAmount,
    totalCount: api.items.length,
  };
}

/**
 * 내 장바구니 조회 (Server Component 전용).
 * BE `GET /api/cart` 구현됨(레포 origin/develop) — 라이브 서버 배포 후 config `cart:false`로 전환.
 * 실패는 빈 장바구니로 숨기지 않고 전파 → error.tsx에서 처리.
 */
export async function getCartServer(): Promise<Cart> {
  if (isMock('cart')) {
    return toCart(mockCart);
  }

  const res = await serverApi.get<BeCartResponse>('/api/cart');
  if (!res.success || !res.data) {
    throw new Error('장바구니를 불러오지 못했습니다.');
  }
  return toCartFromApi(res.data);
}
