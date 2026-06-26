import { enroll } from '@/features/enrollments/services';
import type { PaymentType } from '@/features/enrollments/types';
import { api } from '@/services/api';
import { isMock } from '@/mocks/config';

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
