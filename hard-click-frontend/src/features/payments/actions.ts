'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { USE_MOCK, isMock } from '@/mocks/config';
import { mockOrderDetails } from '@/mocks/payments.mock';
import type {
  RefundResult,
  PaymentConfirmInput,
  PaymentConfirmResponseData,
  PaymentConfirmResult,
} from './types';

/**
 * 결제 최종 승인 (Server Action) — 토스 successUrl 진입 후 호출.
 * 흐름: 프론트(토스 결제창에서 paymentKey 획득) → 이 액션 → 백엔드가 금액 검증 + 토스 최종 승인.
 *
 * - `POST /api/payments/confirm` (Idempotency-Key 헤더로 중복 승인 방지)
 * - body: `{ paymentKey, orderId, amount, courseId }`
 *   (OpenAPI 스키마는 courseId/amount만 명시하나 BE가 실제로 paymentKey도 사용)
 */
export async function confirmPaymentAction(
  input: PaymentConfirmInput,
): Promise<PaymentConfirmResult> {
  // 입력 검증 (Server Action 경계)
  const courseIds = Array.isArray(input?.courseIds)
    ? [...new Set(input.courseIds)].filter((n) => Number.isInteger(n) && n > 0)
    : [];
  if (
    typeof input?.paymentKey !== 'string' ||
    input.paymentKey.length === 0 ||
    typeof input.orderId !== 'string' ||
    input.orderId.length === 0 ||
    !Number.isFinite(input.amount) ||
    input.amount <= 0 ||
    courseIds.length === 0
  ) {
    return { success: false, message: '결제 정보가 올바르지 않습니다.' };
  }

  if (isMock('payments')) {
    return {
      success: true,
      message: '결제가 완료되었습니다.',
      status: 'DONE',
      duplicate: false,
    };
  }

  // BE PaymentConfirmRequest = { paymentKey, orderId, amount } (orderId 기반 검증·승인).
  // 주문이 여러 강의(장바구니 선택분)를 담아도 confirm은 orderId 1건으로 처리된다.
  const res = await serverApi.post<PaymentConfirmResponseData>(
    '/api/payments/confirm',
    {
      paymentKey: input.paymentKey,
      orderId: input.orderId,
      amount: input.amount,
    },
    { 'Idempotency-Key': randomUUID() },
  );

  if (!res.success || !res.data) {
    return {
      success: false,
      message: res.message || '결제 승인에 실패했습니다.',
    };
  }

  // 결제 성공 시 수강 등록까지 마쳐야 학습 가능. 선택분 전체를 등록한다.
  // (BE confirm이 enrollment를 자동 생성하지 않을 경우 대비 — 이미 수강 중이면 BE가 멱등 처리)
  await Promise.all(
    courseIds.map((courseId) =>
      serverApi.post('/api/enrollments', { courseId }),
    ),
  );
  revalidatePath('/mypage/courses/in-progress');

  return {
    success: true,
    message: '결제가 완료되었습니다.',
    status: res.data.status,
    duplicate: res.data.duplicate,
  };
}

/**
 * 환불 요청 (Server Action).
 * 결과: 성공 / 규칙상 불가(모달) / 처리 오류(토스트).
 * mock: 선택 항목이 모두 refundable이면 성공, 불가 항목 포함 시 blocked.
 * 연동: POST /api/payment/{orderId}/refund 로 교체 (BE 환불 엔드포인트 추가 시).
 */
export async function refundAction(
  orderId: number,
  courseIds: number[],
  reason: string,
): Promise<RefundResult> {
  if (!reason.trim() || courseIds.length === 0) {
    return { ok: false, kind: 'error' };
  }

  if (USE_MOCK) {
    const order = mockOrderDetails.find((o) => o.orderId === orderId);
    if (!order) return { ok: false, kind: 'error' };
    // 결제완료(PAID) 주문만 환불 가능 — UI 우회 호출 방어
    if (order.status !== 'PAID') {
      return {
        ok: false,
        kind: 'blocked',
        reason: '이미 환불되었거나 환불 대상이 아닌 주문입니다.',
      };
    }
    // 요청 항목이 모두 주문에 존재하고 환불 가능해야 함(중복 제거) — UI가 1차 차단, 여기선 안전망
    const requested = [...new Set(courseIds)];
    const targets = order.items.filter((it) => requested.includes(it.courseId));
    if (
      targets.length !== requested.length ||
      targets.some((it) => !it.refundable)
    ) {
      return {
        ok: false,
        kind: 'blocked',
        reason: '환불할 수 없는 항목이 포함되어 있어요.',
      };
    }
    revalidatePath(`/orders/${orderId}`);
    return { ok: true };
  }

  // TODO(API 연동): POST /api/payment/${orderId}/refund { courseIds, reason }
  // 성공 → { ok:true } / 규칙 위반 → { ok:false, kind:'blocked', reason } / 그 외 → { ok:false, kind:'error' }
  return { ok: false, kind: 'error' };
}
