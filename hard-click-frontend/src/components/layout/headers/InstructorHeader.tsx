'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { authStore } from '@/store/auth.store';
import { logout } from '@/features/auth/services';

const NAV_ITEMS = [
  { label: '강의', href: '/instructor/courses' },
  { label: '퀴즈', href: '/instructor/quizzes' },
  { label: '공지', href: '/instructor/notices' },
  { label: '내 강의', href: '/instructor/myCourses' },
  { label: '대시보드', href: '/instructor/dashboard' },
];

export default function InstructorHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    authStore.clear();
    router.push('/courses');
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[#2F5DAA] shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.08)] flex-shrink-0">
      <div className="w-full max-w-[1440px] mx-auto px-8 h-full flex items-center">
        {/* 로고 */}
        <div className="flex-1">
          <Link
            href="/instructor/courses"
            className="flex items-center gap-3 w-fit"
          >
            <Image src="/logos/logo.svg" alt="logo" width={28} height={28} />
            <span className="text-white font-bold text-xl">FLOWN</span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-[40px]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`h-10 px-4 flex items-center font-medium text-base text-white rounded-2xl transition-colors whitespace-nowrap ${
                  isActive ? 'bg-[#1D3E75]' : 'hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측 */}
        <div className="flex-1 flex items-center gap-6 justify-end">
          {/* 알림 */}
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
            <span className="absolute top-[-2px] left-[23px] min-w-[16px] h-4 bg-[#EF4444] rounded-full flex items-center justify-center px-[3px]">
              <span className="text-white font-bold text-[10px] leading-none">
                3
              </span>
            </span>
          </Link>

          {/* 프로필 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/30 transition-colors overflow-hidden"
            >
              <Image
                src="/icons/headerPerson.svg"
                alt="프로필"
                width={28}
                height={28}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-[160px] rounded-2xl border border-[#E2E8F0] bg-white shadow-lg overflow-hidden z-50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-5 py-4 text-sm text-center text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
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
