import AdminStatCard from '@/features/admin/components/AdminStatCard';
import type { ChurnStats } from '../types';

/** 이탈 관리 상단 지표 카드 4개 (Server Component). */
export default function ChurnStatCards({ stats }: { stats: ChurnStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AdminStatCard
        label="고위험 학생"
        value={stats.highRiskCount}
        icon="/icons/RedFlag.svg"
        valueColor="text-[#DC2626]"
        iconBg="bg-[#FEF2F2]"
      />
      <AdminStatCard
        label="중위험 학생"
        value={stats.midRiskCount}
        icon="/icons/warningIcon.svg"
        valueColor="text-[#D97706]"
        iconBg="bg-[#FFF7ED]"
      />
      <AdminStatCard
        label="이번 주 신규"
        value={stats.newThisWeekCount}
        icon="/icons/trendUpBlueIcon.svg"
        valueColor="text-[#2F5DAA]"
        iconBg="bg-[#EFF6FF]"
      />
      <AdminStatCard
        label="평균 위험 점수"
        value={`${stats.avgRiskScore} / 100`}
        icon="/icons/targetIcon.svg"
        valueColor="text-[#1E293B]"
        iconBg="bg-[#F1F5F9]"
      />
    </div>
  );
}
