export const dynamic = 'force-dynamic';

import Image from 'next/image';
import AdminDashboardStats from '@/features/admin/components/AdminDashboardStats';
import AdminQuickActions from '@/features/admin/components/AdminQuickActions';
import AdminRecentReports from '@/features/admin/components/AdminRecentReports';
import AdminRecentNotices from '@/features/admin/components/AdminRecentNotices';
import { serverApi } from '@/lib/api';
import type { AdminRecentReport, AdminRecentNotice } from '@/mocks/admin.mock';
import type { ReportListApiResponse } from '@/mocks/reports.mock';
import type { NoticeApiResponse } from '@/features/notices/types';

const REPORT_TYPE_LABEL: Record<string, string> = {
  POST: '게시글',
  COMMENT: '댓글',
  REVIEW: '리뷰',
};
const REPORT_STATUS_LABEL: Record<string, string> = {
  PENDING: '대기 중',
  COMPLETED: '처리 완료',
  REJECTED: '반려',
};

export default async function AdminDashboardPage() {
  const [reportsRes, noticesRes] = await Promise.all([
    serverApi.get<ReportListApiResponse>('/api/admin/reports?page=0&size=3'),
    serverApi.get<NoticeApiResponse>('/api/notices?type=GLOBAL&page=0&size=3'),
  ]);

  const recentReports: AdminRecentReport[] =
    reportsRes.success && reportsRes.data
      ? reportsRes.data.content.slice(0, 3).map((r, idx) => ({
          id: idx + 1,
          type: REPORT_TYPE_LABEL[r.targetType] ?? r.targetType,
          status: REPORT_STATUS_LABEL[r.status] ?? r.status,
          title: r.reasonStats[0]?.reason ?? r.targetContent.slice(0, 20),
          date: r.createdAt,
          reportKey: `${r.targetType}-${r.targetId}`,
        }))
      : [];

  const recentNotices: AdminRecentNotice[] =
    noticesRes.success && noticesRes.data
      ? noticesRes.data.content.slice(0, 3).map((n) => ({
          id: n.noticeId,
          badge: n.isPinned ? '중요' : '일반',
          title: n.title,
          date: n.createdAt.split('T')[0] ?? n.createdAt,
        }))
      : [];

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
            <Image
              src="/icons/adminDashboard.svg"
              alt="admin"
              width={36}
              height={36}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">
              관리자 대시보드
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              FLOWN LMS 전체 현황을 관리하세요
            </p>
          </div>
        </div>

        {/* 통계 카드 영역 */}
        <div className="mb-8">
          <AdminDashboardStats />
        </div>

        {/* 빠른 관리 영역 */}
        <div className="mb-8">
          <AdminQuickActions />
        </div>

        {/* 최근 신고 / 최근 공지 */}
        <div className="grid grid-cols-2 gap-5">
          <AdminRecentReports reports={recentReports} />
          <AdminRecentNotices notices={recentNotices} />
        </div>
      </div>
    </div>
  );
}
