import Image from 'next/image';
import type { ReportStatus } from '../types';

const STATUS_STYLE: Record<
  ReportStatus,
  { label: string; className: string; icon: string }
> = {
  PENDING: {
    label: '처리 대기',
    className: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    icon: '/icons/OrangePending.svg',
  },
  COMPLETED: {
    label: '처리 완료',
    className: 'bg-[#16A34A]/10 text-[#16A34A]',
    icon: '/icons/GreenCheck.svg',
  },
  REJECTED: {
    label: '반려',
    className: 'bg-[#4B5563]/10 text-[#4B5563]',
    icon: '/icons/GrayReject.svg',
  },
};

export default function ReportStatusBadge({
  status,
}: {
  status: ReportStatus;
}) {
  const { label, className, icon } = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      <Image src={icon} alt="" width={12} height={12} />
      {label}
    </span>
  );
}
