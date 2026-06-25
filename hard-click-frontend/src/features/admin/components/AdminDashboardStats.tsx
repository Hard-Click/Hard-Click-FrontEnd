import AdminStatCard from './AdminStatCard';
import type { DashboardStats } from '@/features/admin/server';

interface AdminDashboardStatsProps {
  stats: DashboardStats;
}

export default function AdminDashboardStats({ stats }: AdminDashboardStatsProps) {
  const STATS = [
    {
      label: '전체 사용자',
      value: stats.totalMemberCount.toLocaleString(),
      icon: '/icons/users.svg',
      valueColor: 'text-[#2F5DAA]',
      iconBg: 'bg-[#EEF2FF]',
    },
    {
      label: '신고 대기',
      value: stats.pendingReportCount.toLocaleString(),
      icon: '/icons/AdminReport.svg',
      valueColor: 'text-[#F97316]',
      iconBg: 'bg-[#FFF4E5]',
    },
    {
      label: '전체 강의',
      value: stats.totalCourseCount.toLocaleString(),
      icon: '/icons/bookIcon.svg',
      valueColor: 'text-[#2F5DAA]',
      iconBg: 'bg-[#EEF2FF]',
    },
    {
      label: '전체 공지',
      value: stats.totalNoticeCount.toLocaleString(),
      icon: '/icons/dashboardNotice.svg',
      valueColor: 'text-[#2F5DAA]',
      iconBg: 'bg-[#EEF2FF]',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-5">
      {STATS.map((s) => (
        <AdminStatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
