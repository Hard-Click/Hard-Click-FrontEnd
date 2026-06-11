import Image from 'next/image';
import Link from 'next/link';

interface AdminQuickActionCardProps {
  title: string;
  desc: string;
  icon: string;
  href: string;
}

export default function AdminQuickActionCard({
  title,
  desc,
  icon,
  href,
}: AdminQuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] p-4 transition hover:bg-[#F8FAFC]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F5DAA]">
        <Image src={icon} alt={title} width={22} height={22} />
      </span>
      <div>
        <p className="text-sm font-semibold text-[#1E293B]">{title}</p>
        <p className="text-xs text-[#94A3B8]">{desc}</p>
      </div>
    </Link>
  );
}
