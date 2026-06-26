'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function refundPaymentAction(paymentId: number): Promise<ActionResult> {
  try {
    const res = await serverApi.post(`/api/admin/payments/${paymentId}/refund`, {});
    if (!res.success) {
      return { success: false, message: res.message ?? '환불 처리에 실패했습니다.' };
    }
  } catch {
    return { success: false, message: '환불 처리 중 오류가 발생했습니다.' };
  }
  revalidatePath('/admin/payments');
  return { success: true, message: '환불 처리가 완료됐습니다.' };
}
