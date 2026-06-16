/**
 * 찜한 강의(위시리스트) 목 데이터.
 * ⚠️ BE 미구현 — 노션/Swagger 명세에 찜 API 없음(강의 상세에도 "찜 API 엔드포인트 명세에 없음" TODO).
 *    현행 UI 기준 가정(assumed) shape. 연동 시 GET /api/wishlist 응답으로 교체.
 * 강의 데이터는 catalog(courses.mock)와 일관된 수능 강의 사용(Figma의 React/Node.js는 placeholder라 미사용 — 장바구니와 동일 방침).
 */

export type WishlistPriceType = 'FREE' | 'PAID';

/** GET /api/wishlist → items[] (가정 shape) */
export interface WishlistApiItem {
  courseId: number;
  title: string;
  instructorName: string;
  subjectName: string;
  price: number;
  priceType: WishlistPriceType;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  thumbnailUrl: string; // 없으면 '' (UI는 placeholder)
  /** 이미 결제·수강 중 → 학습하기 */
  isEnrolled: boolean;
  /** 이미 장바구니에 담김 → 장바구니로 가기 */
  isInCart: boolean;
}

/** GET /api/wishlist → WishlistResponse (가정 shape) */
export interface WishlistApiResponse {
  items: WishlistApiItem[];
  totalCount: number;
}

export const mockWishlist: WishlistApiResponse = {
  items: [
    // 유료 · 미수강 · 장바구니 미담김 → "장바구니 담기"
    {
      courseId: 1,
      title: '2026 수능 국어 완성반',
      instructorName: '김강사',
      subjectName: '국어',
      price: 99000,
      priceType: 'PAID',
      averageRating: 4.8,
      reviewCount: 312,
      studentCount: 1820,
      thumbnailUrl: '',
      isEnrolled: false,
      isInCart: false,
    },
    // 유료 · 수강 중 → "학습하기"
    {
      courseId: 3,
      title: '2026 수능 수학 개념완성',
      instructorName: '박강사',
      subjectName: '수학',
      price: 89000,
      priceType: 'PAID',
      averageRating: 4.9,
      reviewCount: 256,
      studentCount: 2140,
      thumbnailUrl: '',
      isEnrolled: true,
      isInCart: false,
    },
    // 무료 · 미수강 → "무료로 수강하기"
    {
      courseId: 5,
      title: '영어 빈칸추론 집중 훈련',
      instructorName: '이강사',
      subjectName: '영어',
      price: 0,
      priceType: 'FREE',
      averageRating: 4.7,
      reviewCount: 540,
      studentCount: 5230,
      thumbnailUrl: '',
      isEnrolled: false,
      isInCart: false,
    },
  ],
  totalCount: 3,
};
