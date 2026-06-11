'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: '강의', href: '/admin/courses' },
  { label: '커뮤니티', href: '/admin/community' },
  { label: '공지', href: '/admin/notices' },
  { label: '신고', href: '/admin/reports' },
  { label: '대시보드', href: '/admin/dashboard' },
];

export default function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-16 w-full flex-shrink-0 bg-[#2F5DAA] shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center px-8">
        {/* 로고 */}
        <div className="flex-1">
          <Link
            href="/admin/dashboard"
            className="flex w-fit items-center gap-3"
          >
            <Image src="/logos/logo.svg" alt="logo" width={28} height={28} />
            <span className="text-xl font-bold text-white">FLOWN</span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-[40px]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-10 items-center whitespace-nowrap rounded-2xl px-4 text-base font-medium text-white transition-colors ${
                  isActive ? 'bg-[#1D3E75]' : 'hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측 — 관리자 뱃지 */}
        <div className="flex flex-1 items-center justify-end gap-6">
          <Link
            href="/notifications"
            className="relative w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-colors"
          >
            <Image
              src="/icons/bellIcon.svg"
              alt="알림"
              width={20}
              height={20}
            />
          </Link>
          <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white">
            관리자
          </span>
        </div>
      </div>
    </header>
  );
}
