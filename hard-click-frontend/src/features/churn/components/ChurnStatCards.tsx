import AdminStatCard from '@/features/admin/components/AdminStatCard';
import type { ChurnStats } from '../types';

/** 평균 위험 점수 구간별 색: 35 미만 검정 / 35~70 미만 노랑 / 70 이상 빨강 */
function riskScoreColor(score: number): string {
  if (score >= 70) return 'text-[#DC2626]';
  if (score >= 35) return 'text-[#D97706]';
  return 'text-[#1E293B]';
}

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
        value={
          <>
            <span className={riskScoreColor(stats.avgRiskScore)}>
              {stats.avgRiskScore}
            </span>
            <span className="text-lg font-semibold text-[#94A3B8]"> / 100</span>
          </>
        }
        icon="/icons/targetIcon.svg"
        valueColor=""
        iconBg="bg-[#F1F5F9]"
      />
    </div>
  );
}
