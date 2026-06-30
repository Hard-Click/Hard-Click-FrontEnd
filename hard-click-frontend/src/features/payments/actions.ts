'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
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
  // courseIds는 선택 — 구독 결제는 수강할 강의가 없다(confirm이 구독권을 지급). paymentKey/orderId/amount만 필수.
  if (
    typeof input?.paymentKey !== 'string' ||
    input.paymentKey.length === 0 ||
    typeof input.orderId !== 'string' ||
    input.orderId.length === 0 ||
    !Number.isFinite(input.amount) ||
    input.amount <= 0
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
  // - 중복 승인(성공 URL 새로고침 등)이면 첫 승인 때 이미 등록됨 → 재등록 생략(멱등).
  // - serverApi.post는 throw하지 않고 {success:false}를 반환하므로, Promise.all 결과를 확인해
  //   일부 등록 실패를 감지하고 사용자에게 알린다(§0.1④ — 결제됐는데 미등록을 조용히 숨기지 않음).
  // 구독(courseIds 없음)은 BE confirm이 구독권을 지급하므로 FE 수강등록 호출 없음. 강의 결제만 등록.
  let enrollWarning: string | undefined;
  if (!res.data.duplicate && courseIds.length > 0) {
    const results = await Promise.all(
      courseIds.map((courseId) =>
        serverApi.post('/api/enrollments', { courseId }),
      ),
    );
    // 409 EN001('이미 수강 중')은 실패가 아니다 — 이미 보유한 강의를 재결제했거나 BE가
    // 결제 승인 때 자동 등록한 경우. 사용자는 강의에 접근 가능하므로 경고하지 않는다(멱등 처리).
    // (라이브 확인 2026-06-27: 보유 강의 재등록 → 409 EN001 "이미 수강 중인 강의입니다.")
    const failed = results.filter(
      (r) => !r.success && r.httpStatus !== 409 && r.errorCode !== 'EN001',
    ).length;
    if (failed > 0) {
      enrollWarning = `결제는 완료됐지만 ${failed}개 강의의 수강 등록에 실패했어요. 고객센터로 문의해주세요.`;
    }
  }
  // 결제 후 상태가 바뀌는 페이지 갱신: 수강중 강의 + 결제내역(/orders) + 구독 상태(/subscriptions)
  revalidatePath('/mypage/courses/in-progress');
  revalidatePath('/orders');
  revalidatePath('/subscriptions');

  return {
    success: true,
    message: '결제가 완료되었습니다.',
    status: res.data.status,
    duplicate: res.data.duplicate,
    enrollWarning,
  };
}

/**
 * 환불 요청 (Server Action).
 * 결과: 성공 / 규칙상 불가(모달) / 처리 오류(토스트).
 * mock: 선택 항목이 모두 refundable이면 성공, 불가 항목 포함 시 blocked.
 * 연동(강의): POST /api/order/{orderId}/items/{courseId}/refund (per-item, Idempotency-Key 헤더).
 *   ⚠️ BE는 항목별(courseId 1개씩) 환불 모델 — courseIds 배열은 항목마다 반복 호출(부분환불=여러 번). (라이브 검증 2026-06-27)
 * 연동(구독, isSubscription): POST /api/order/{orderId}/refund (주문 단위 전액 환불, courseId 없음).
 *   구독 주문은 order_items가 없어 per-item이 불가 → BE가 별도 엔드포인트 제공(OrderController.refundSubscription, BE 코드 ba34f83 검증).
 */
export async function refundAction(
  orderId: number,
  courseIds: number[],
  reason: string,
  isSubscription = false,
): Promise<RefundResult> {
  if (!reason.trim() || courseIds.length === 0) {
    return { ok: false, kind: 'error' };
  }

  if (isMock('payments')) {
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

  // 구독: 주문 단위 환불 — POST /api/order/{orderId}/refund (orderId만, Idempotency-Key UUID 헤더, body 없음).
  //   구독 주문은 item이 없어 per-item이 불가(courseId=0 합성) → BE 별도 엔드포인트(OrderController.refundSubscription).
  //   ⚠️ 실 환불 호출은 파괴적이라 미테스트 — BE 코드(ba34f83) 시그니처 기준 배선. courseIds 미사용(orderId 기준).
  if (isSubscription) {
    const res = await serverApi.post(`/api/order/${orderId}/refund`, undefined, {
      'Idempotency-Key': randomUUID(),
    });
    if (res.success) {
      revalidatePath(`/orders/${orderId}`);
      revalidatePath('/subscriptions'); // 구독 해지 상태 반영
      return { ok: true };
    }
    return res.httpStatus === 400 || res.httpStatus === 409
      ? { ok: false, kind: 'blocked', reason: '환불 조건을 충족하지 않아요.' }
      : { ok: false, kind: 'error' };
  }

  // 라이브: 항목별(per-item) POST /api/order/{orderId}/items/{courseId}/refund (Idempotency-Key 헤더, body 없음).
  // ⚠️ BE는 "본인이 결제한 PAID 주문의 refundable 항목"만 정상 처리(그 외엔 BE 오류) → UI(OrderRefundView)가
  //    refundable 항목만 보내고 불가 항목은 호출 전 "환불 불가" 모달로 차단한다. 여기선 그 항목들만 호출.
  // reason은 BE가 받지 않음(엔드포인트 body 없음) — FE 입력용. 부분환불은 항목 수만큼 반복(per-item).
  const ids = [...new Set(courseIds)].filter((n) => Number.isInteger(n) && n > 0);
  if (ids.length === 0) return { ok: false, kind: 'error' };
  const results = await Promise.all(
    ids.map((courseId) =>
      serverApi.post(`/api/order/${orderId}/items/${courseId}/refund`, undefined, {
        'Idempotency-Key': randomUUID(),
      }),
    ),
  );
  if (results.every((r) => r.success)) {
    revalidatePath(`/orders/${orderId}`);
    return { ok: true };
  }
  // 일부/전부 실패 — 환불 규칙 위반(400/409)은 안내(blocked), 그 외는 처리 오류(error)
  const ruleViolation = results.some(
    (r) => !r.success && (r.httpStatus === 400 || r.httpStatus === 409),
  );
  return ruleViolation
    ? { ok: false, kind: 'blocked', reason: '환불 조건을 충족하지 않는 항목이 있어요.' }
    : { ok: false, kind: 'error' };
}
