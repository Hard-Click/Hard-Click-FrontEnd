import Image from 'next/image';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: string;
  valueColor: string;
  iconBg: string;
}

export default function AdminStatCard({
  label,
  value,
  icon,
  valueColor,
  iconBg,
}: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-[14px] ${iconBg}`}
        >
          <Image src={icon} alt={label} width={18} height={18} />
        </span>
        <span className="text-sm text-[#4B5563]">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
