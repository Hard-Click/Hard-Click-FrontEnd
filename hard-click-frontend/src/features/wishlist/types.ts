/**
 * 찜한 강의(위시리스트) 도메인 타입 — UI는 이 타입에만 의존(격리막).
 * 찜 API는 BE 미구현(명세 없음) → server.ts가 USE_MOCK 분기 + 가정 shape 매핑.
 */

/** 찜한 강의 1개 (UI 계약) — 상태(isEnrolled/isFree/isInCart)가 액션 버튼을 결정 */
export interface WishlistCourse {
  courseId: number;
  title: string;
  instructorName: string;
  subjectName: string;
  /** 가격(원). 무료면 0 */
  price: number;
  isFree: boolean;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  /** 썸네일 URL (없으면 placeholder) */
  thumbnailUrl?: string;
  /** 결제·수강 중 → 학습하기 */
  isEnrolled: boolean;
  /** 장바구니에 담김 → 장바구니로 가기 */
  isInCart: boolean;
}
