import Image from 'next/image';

interface StatItem {
  icon: string;
  iconBg: string;
  label: string;
  value: number;
  valueColor: string;
}

const STATS: StatItem[] = [
  {
    icon: '/icons/bookIcon.svg',
    iconBg: '#EFF6FF',
    label: '전체 강의',
    value: 12,
    valueColor: '#2F5DAA',
  },
  {
    icon: '/icons/openEye.svg',
    iconBg: '#F0FDF4',
    label: '공개 강의',
    value: 9,
    valueColor: '#16A34A',
  },
  {
    icon: '/icons/closeEye.svg',
    iconBg: '#FFF7ED',
    label: '숨김 강의',
    value: 3,
    valueColor: '#EA580C',
  },
  {
    icon: '/icons/studentsBlueIcon.svg',
    iconBg: '#EFF6FF',
    label: '수강생 수',
    value: 245,
    valueColor: '#2F5DAA',
  },
  {
    icon: '/icons/documentIcon.svg',
    iconBg: '#EFF6FF',
    label: '퀴즈 수',
    value: 36,
    valueColor: '#2F5DAA',
  },
];

export default function InstructorStatsCard() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {STATS.map((stat) => (
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
            {stat.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
