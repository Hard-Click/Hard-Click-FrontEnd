import { enroll } from '@/features/enrollments/services';
import type { PaymentType } from '@/features/enrollments/types';
import { api } from '@/services/api';
import { isMock } from '@/mocks/config';

// TODO: Replace stubs with real API calls when backend is ready

/* ── 수강신청 ── */

/**
 * 수강신청 (실제 API 연동됨)
 * POST /api/enrollments — features/enrollments/services.ts 호출
 * 무료: paymentType='FREE'로 즉시 수강권 생성
 * 유료: paymentType='PAID', 결제 페이지에서 처리 권장
 */
export async function enrollCourse(
  courseId: number,
  paymentType: PaymentType = 'FREE',
): Promise<{
  success: boolean;
  message: string;
  enrollmentId?: number;
}> {
  const result = await enroll({ courseId, paymentType });
  return {
    success: result.success,
    message: result.message ?? (result.success ? '수강신청이 완료되었습니다.' : '수강신청에 실패했습니다.'),
    enrollmentId: result.data?.enrollmentId,
  };
}

/* ── 장바구니 ── */

/**
 * 장바구니 담기 — POST /api/cart { courseId } (중복 시 409).
 * BE는 cartItemId를 따로 주지 않고 courseId로 식별·삭제하므로 cartItemId=courseId로 반환.
 */
export async function addToCart(courseId: number): Promise<{
  success: boolean;
  message: string;
  cartItemId?: number;
}> {
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return { success: false, message: '잘못된 강의입니다.' };
  }
  if (isMock('cart')) {
    return {
      success: true,
      message: '장바구니에 추가되었습니다.',
      cartItemId: courseId,
    };
  }
  const res = await api.post('/api/cart', { courseId });
  if (!res.success) {
    // 409 = 이미 담긴 강의
    return {
      success: false,
      message: res.message || '장바구니 담기에 실패했습니다.',
    };
  }
  return {
    success: true,
    message: '장바구니에 추가되었습니다.',
    cartItemId: courseId,
  };
}

/** 장바구니 빼기 — DELETE /api/cart/{courseId} (식별자=courseId) */
export async function removeFromCart(cartItemId: number): Promise<{
  success: boolean;
  message: string;
}> {
  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    return { success: false, message: '잘못된 항목입니다.' };
  }
  if (isMock('cart')) {
    return { success: true, message: '장바구니에서 제거되었습니다.' };
  }
  const res = await api.delete(`/api/cart/${cartItemId}`);
  if (!res.success) {
    return { success: false, message: res.message || '제거에 실패했습니다.' };
  }
  return { success: true, message: '장바구니에서 제거되었습니다.' };
}

/* ── 리뷰 ── */

// PATCH /api/courses/{courseId}/reviews/{reviewId}
// 본인 리뷰/별점 수정 및 평균 별점 재계산
export async function updateReview(
  courseId: number,
  reviewId: number,
  data: { rating: number; content: string }
): Promise<{ success: boolean; message: string }> {
  console.log('[stub] PATCH /api/courses/' + courseId + '/reviews/' + reviewId, data);
  return { success: true, message: '리뷰가 수정되었습니다.' };
}

// DELETE /api/courses/{courseId}/reviews/{reviewId}
// 본인 리뷰 삭제 및 평균 별점 재계산
export async function deleteReview(
  courseId: number,
  reviewId: number
): Promise<{ success: boolean; message: string }> {
  console.log('[stub] DELETE /api/courses/' + courseId + '/reviews/' + reviewId);
  return { success: true, message: '리뷰가 삭제되었습니다.' };
}

/* ── 신고 ── */

// POST /api/reports
// 타인 콘텐츠 복수 사유 신고 (5명 누적 체크)
// targetType: 'REVIEW' | 'POST' | 'COMMENT'
// reasons: ['부적절한 언어 사용', '명예훼손', '음란', '스팸/광고', '개인정보 노출', '욕설 및 비하', '기타']
export async function reportContent(data: {
  targetId: number;
  targetType: 'REVIEW' | 'POST' | 'COMMENT';
  reasons: string[];
}): Promise<{ success: boolean; message: string }> {
  console.log('[stub] POST /api/reports', data);
  return { success: true, message: '신고가 접수되었습니다.' };
}

/* ── 진도 ── */

// GET /api/learning/courses/{courseId}/progress
// 해당 강의의 전체 진도율과 영상별 학습 상태 조회
export async function getCourseProgress(courseId: number): Promise<{
  progressRate: number;
  lessons: { lessonId: number; completed: boolean; lastPositionSeconds: number }[];
} | null> {
  console.log('[stub] GET /api/learning/courses/' + courseId + '/progress');
  return null;
}
