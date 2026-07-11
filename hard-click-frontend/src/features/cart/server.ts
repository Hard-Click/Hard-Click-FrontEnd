import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { getCurrentUser } from '@/features/auth/session';
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
 * 내 "보유중(수강중/완료)" courseId 집합 — 이미 산 강의를 장바구니에서 숨기기 위함.
 * courses/server.ts와 동일한 검증된 호출(GET /api/enrollments/me?status=ALL) + 동일한 필터.
 * ⚠️ status=ALL은 환불(REFUNDED)·만료(EXPIRED)까지 포함하므로 active(IN_PROGRESS/COMPLETED)만
 *    '보유중'으로 본다. REFUNDED를 '보유중'으로 오판하면 환불한 강의를 다시 담아도 장바구니에서
 *    숨겨져 재구매가 막힌다(상세는 '수강신청'으로 뜨는데 장바구니 경로만 죽음). BE 영상접근·내강의
 *    목록도 IN_PROGRESS/COMPLETED로만 판정 — 동일 정책.
 * 비로그인이면 호출 생략. 실패 봉투든 예외든 빈 집합 → 필터 미적용(장바구니 노출 자체는 막지 않음).
 */
async function getEnrolledCourseIds(): Promise<Set<number>> {
  const user = await getCurrentUser();
  if (!user) return new Set();
  try {
    const res = await serverApi.get<{ courseId: number; status: string }[]>(
      '/api/enrollments/me?status=ALL',
    );
    if (!res.success || !Array.isArray(res.data)) return new Set();
    return new Set(
      res.data
        .filter((e) => e.status === 'IN_PROGRESS' || e.status === 'COMPLETED')
        .map((e) => e.courseId),
    );
  } catch {
    return new Set();
  }
}

/** 이미 수강중인 강의를 장바구니 목록에서 제외하고 합계·개수를 재계산한다. */
function excludeEnrolled(cart: Cart, enrolledIds: Set<number>): Cart {
  if (enrolledIds.size === 0) return cart;
  const items = cart.items.filter((it) => !enrolledIds.has(it.courseId));
  if (items.length === cart.items.length) return cart; // 제외할 항목 없음
  return {
    ...cart,
    items,
    totalPrice: items.reduce((sum, it) => sum + it.price, 0),
    totalCount: items.length,
  };
}

/**
 * 내 장바구니 조회 (Server Component 전용).
 * BE `GET /api/cart` 구현됨(레포 origin/develop) — 라이브 서버 배포 후 config `cart:false`로 전환.
 * ⚠️ 이미 수강중(구매 완료)인 강의는 장바구니에서 숨긴다 — BE는 실결제 승인 시에만 cart를
 *    비우고 무료수강/재담기는 안 막아, 산 강의가 그대로 남기 때문(수강목록과 대조해 제외).
 * 실패는 빈 장바구니로 숨기지 않고 전파 → error.tsx에서 처리.
 */
export async function getCartServer(): Promise<Cart> {
  if (isMock('cart')) {
    return toCart(mockCart);
  }

  // 장바구니 + 수강중 목록을 병렬 조회 → 이미 산 강의는 목록에서 제외
  const [res, enrolledIds] = await Promise.all([
    serverApi.get<BeCartResponse>('/api/cart'),
    getEnrolledCourseIds(),
  ]);
  if (!res.success || !res.data) {
    throw new Error('장바구니를 불러오지 못했습니다.');
  }
  return excludeEnrolled(toCartFromApi(res.data), enrolledIds);
}
