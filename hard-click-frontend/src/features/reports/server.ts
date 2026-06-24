import { serverApi } from '@/lib/api';
import { toReportItem } from './types';
import type { ReportItem, ReportListApiResponse } from './types';

export async function getAdminReportsServer(): Promise<ReportItem[]> {
  const res = await serverApi.get<ReportListApiResponse>(
    '/api/admin/reports?page=0&size=100',
  );
  if (!res.success) throw new Error(res.message ?? '신고 목록 조회에 실패했습니다.');
  return res.data?.content?.map(toReportItem) ?? [];
}
