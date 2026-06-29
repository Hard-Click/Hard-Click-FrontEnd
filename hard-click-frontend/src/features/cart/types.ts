/**
 * 장바구니 도메인 타입 — UI는 이 타입에만 의존(격리막).
 * BE 연동 완료 — GET /api/cart(조회)·DELETE /api/cart/{courseId}(삭제) 실서버 호출(server.ts/actions.ts, config cart:false).
 */

/** 장바구니 항목 1개 (UI 계약) */
export interface CartItem {
  /** 장바구니 항목 식별자(삭제용) */
  cartItemId: number;
  /** 강의 식별자 */
  courseId: number;
  /** 강의명 */
  title: string;
  /** 강사명 */
  instructor: string;
  /** 가격(원) */
  price: number;
  /** 강의 썸네일 URL (연동 시 next/image) */
  thumbnailUrl: string;
}

/** 장바구니 (UI 계약) */
export interface Cart {
  items: CartItem[];
  /** 전체 합계(원) */
  totalPrice: number;
  /** 담긴 강의 수 */
  totalCount: number;
}
