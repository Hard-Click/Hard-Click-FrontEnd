import Image from 'next/image';
import type { InstructorDashboardStats } from '../server';

interface StatConfig {
  icon: string;
  iconBg: string;
  label: string;
  key: keyof InstructorDashboardStats;
  valueColor: string;
}

// 표시 설정(아이콘·색·라벨)만 상수로 두고, 값은 API(stats)에서 채운다.
const STAT_CONFIG: StatConfig[] = [
  { icon: '/icons/bookIcon.svg', iconBg: '#EFF6FF', label: '전체 강의', key: 'totalCourses', valueColor: '#2F5DAA' },
  { icon: '/icons/openEye.svg', iconBg: '#F0FDF4', label: '공개 강의', key: 'publishedCourses', valueColor: '#16A34A' },
  { icon: '/icons/closeEye.svg', iconBg: '#FFF7ED', label: '숨김 강의', key: 'hiddenCourses', valueColor: '#EA580C' },
  { icon: '/icons/studentsBlueIcon.svg', iconBg: '#EFF6FF', label: '수강생 수', key: 'totalStudents', valueColor: '#2F5DAA' },
  { icon: '/icons/documentIcon.svg', iconBg: '#EFF6FF', label: '퀴즈 수', key: 'quizCount', valueColor: '#2F5DAA' },
];

interface InstructorStatsCardProps {
  stats: InstructorDashboardStats;
}

export default function InstructorStatsCard({ stats }: InstructorStatsCardProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {STAT_CONFIG.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: stat.iconBg }}
            >
              <Image src={stat.icon} alt={stat.label} width={18} height={18} />
            </div>
            <span className="text-sm text-[#64748B]">{stat.label}</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: stat.valueColor }}>
            {stats[stat.key].toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
