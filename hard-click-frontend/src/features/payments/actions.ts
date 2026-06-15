'use server';

import { revalidatePath } from 'next/cache';
import { USE_MOCK } from '@/mocks/config';
import { mockOrderDetails } from '@/mocks/payments.mock';
import type { RefundResult } from './types';

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
