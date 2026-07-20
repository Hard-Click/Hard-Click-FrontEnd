import AdminStatCard from './AdminStatCard';
import type { DashboardStats } from '@/features/admin/server';

interface AdminDashboardStatsProps {
  stats: DashboardStats;
}

export default function AdminDashboardStats({ stats }: AdminDashboardStatsProps) {
  // 조회 실패 시 진짜 0건처럼 보이지 않도록 숫자 대신 별도 문구 + 색상으로 표시(§0.5 정직성).
  const value = (n: number) => (stats.statsKnown ? n.toLocaleString() : '조회 실패');
  const valueColor = (known: string) => (stats.statsKnown ? known : 'text-[#94A3B8]');

  const STATS = [
    {
      label: '전체 사용자',
      value: value(stats.totalMemberCount),
      icon: '/icons/users.svg',
      valueColor: valueColor('text-[#2F5DAA]'),
      iconBg: 'bg-[#EEF2FF]',
    },
    {
      label: '신고 대기',
      value: value(stats.pendingReportCount),
      icon: '/icons/AdminReport.svg',
      valueColor: valueColor('text-[#F97316]'),
      iconBg: 'bg-[#FFF4E5]',
    },
    {
      label: '전체 강의',
      value: value(stats.totalCourseCount),
      icon: '/icons/bookIcon.svg',
      valueColor: valueColor('text-[#2F5DAA]'),
      iconBg: 'bg-[#EEF2FF]',
    },
    {
      label: '전체 공지',
      value: value(stats.totalNoticeCount),
      icon: '/icons/dashboardNotice.svg',
      valueColor: valueColor('text-[#2F5DAA]'),
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
