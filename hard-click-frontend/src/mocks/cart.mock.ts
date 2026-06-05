/**
 * 장바구니 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/cart (본인 장바구니 목록)
 */

export interface CartItemApiItem {
  cartItemId: number;
  courseId: number;
  courseTitle: string;
  instructorName: string;
  price: number;
  thumbnailUrl: string;
}

export interface CartApiResponse {
  items: CartItemApiItem[];
  totalPrice: number;
  totalCount: number;
}

export const mockCart: CartApiResponse = {
  items: [
    {
      cartItemId: 77,
      courseId: 1,
      courseTitle: '2026 수능 국어 완성반',
      instructorName: '김강사',
      price: 99000,
      thumbnailUrl: 'https://cdn.example.com/courses/1/thumbnail.jpg',
    },
    {
      cartItemId: 78,
      courseId: 3,
      courseTitle: '2026 수능 수학 개념완성',
      instructorName: '박강사',
      price: 89000,
      thumbnailUrl: 'https://cdn.example.com/courses/3/thumbnail.jpg',
    },
  ],
  totalPrice: 188000,
  totalCount: 2,
};
