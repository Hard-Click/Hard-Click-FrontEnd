// TODO: Replace stubs with real API calls when backend is ready

/* ── 수강신청 ── */

// POST /api/enrollments
// 유료: 결제 완료 후 자동 수강권 생성 (결제 페이지 → POST /api/payments → enrollments 자동 처리)
// 무료: 즉시 수강권(enrolled_via='FREE') 생성
export async function enrollCourse(courseId: number): Promise<{
  success: boolean;
  message: string;
  enrollmentId?: number;
}> {
  console.log('[stub] POST /api/enrollments', { courseId });
  return { success: true, message: '수강신청이 완료되었습니다.', enrollmentId: 1 };
}

/* ── 장바구니 ── */

// POST /api/cart
// 중복/이미 수강 중 예외처리 포함
export async function addToCart(courseId: number): Promise<{
  success: boolean;
  message: string;
  cartItemId?: number;
}> {
  console.log('[stub] POST /api/cart', { courseId });
  return { success: true, message: '장바구니에 추가되었습니다.', cartItemId: 1 };
}

// DELETE /api/cart/{cartItemId}
export async function removeFromCart(cartItemId: number): Promise<{
  success: boolean;
  message: string;
}> {
  console.log('[stub] DELETE /api/cart/' + cartItemId);
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
