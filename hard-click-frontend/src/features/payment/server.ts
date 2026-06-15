import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import { mockAdminPaymentList } from '@/mocks/adminPayments.mock';
import type { AdminPayment, AdminPaymentListApiResponse } from './types';
import { toAdminPayment } from './types';

/** 결제 관리 — 전체 결제 내역 서버 조회 (GET /api/admin/payments, 관리자) */
export async function getAdminPaymentsServer(): Promise<AdminPayment[]> {
  if (USE_MOCK) return mockAdminPaymentList.content.map(toAdminPayment);
  const res = await serverApi.get<AdminPaymentListApiResponse>(
    '/api/admin/payments',
  );
  return res.success && Array.isArray(res.data?.content)
    ? res.data.content.map(toAdminPayment)
    : [];
}
