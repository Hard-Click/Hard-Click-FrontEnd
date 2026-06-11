import Image from 'next/image';
import AdminDashboardStats from '@/features/admin/components/AdminDashboardStats';

export default function AdminDashboardPage() {
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
        {/* <AdminQuickActions /> */}

        {/* 최근 신고 / 최근 공지 */}
        {/* <AdminRecentReports /> */}
        {/* <AdminRecentNotices /> */}
      </div>
    </div>
  );
}
