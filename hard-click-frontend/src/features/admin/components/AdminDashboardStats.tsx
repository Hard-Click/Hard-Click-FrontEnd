import AdminStatCard from './AdminStatCard';

const STATS = [
  {
    label: '전체 사용자',
    value: '1,245',
    icon: '/icons/users.svg',
    valueColor: 'text-[#2F5DAA]',
    iconBg: 'bg-[#EEF2FF]',
  },
  {
    label: '신고 대기',
    value: '12',
    icon: '/icons/AdminReport.svg',
    valueColor: 'text-[#F97316]',
    iconBg: 'bg-[#FFF4E5]',
  },
  {
    label: '전체 강의',
    value: '87',
    icon: '/icons/bookIcon.svg',
    valueColor: 'text-[#2F5DAA]',
    iconBg: 'bg-[#EEF2FF]',
  },
  {
    label: '전체 공지',
    value: '45',
    icon: '/icons/dashboardNotice.svg',
    valueColor: 'text-[#2F5DAA]',
    iconBg: 'bg-[#EEF2FF]',
  },
];

export default function AdminDashboardStats() {
  return (
    <div className="grid grid-cols-4 gap-5">
      {STATS.map((s) => (
        <AdminStatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
