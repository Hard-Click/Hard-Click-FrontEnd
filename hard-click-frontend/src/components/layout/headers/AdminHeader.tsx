'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { logout } from '@/features/auth/services';
import { clearSession } from '@/features/auth/session';
import NotificationDropdown from '@/features/notifications/components/NotificationDropdown';

const NAV_ITEMS = [
  { label: '강의', href: '/admin/courses' },
  { label: '커뮤니티', href: '/admin/community' },
  { label: '공지', href: '/admin/notices' },
  { label: '신고', href: '/admin/reports' },
  { label: '사용자', href: '/admin/users' },
  { label: '결제', href: '/admin/payments' },
  { label: '대시보드', href: '/admin/dashboard' },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    await clearSession();
    router.push('/login');
  };

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

        {/* 우측 */}
        <div className="flex flex-1 items-center justify-end gap-6">
          <NotificationDropdown />

          {/* 관리자 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/30"
            >
              관리자
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-12 z-50 w-[160px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-lg">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-5 py-4 text-center text-sm text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
