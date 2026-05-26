'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: '강의', href: '/instructor/courses' },
  { label: '퀴즈', href: '/instructor/quizzes' },
  { label: '공지', href: '/instructor/notices' },
  { label: '내 강의', href: '/instructor/myCourses' },
  { label: '대시보드', href: '/instructor/dashboard' },
];

export default function InstructorHeader() {
  const pathname = usePathname();

  return (
    <header className="w-full h-16 bg-[#2F5DAA] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] flex-shrink-0">
      <div className="w-full max-w-[1440px] mx-auto px-8 h-full flex items-center">
        {/* 로고 */}
        <Link
          href="/instructor/courses"
          className="flex items-center gap-3 flex-shrink-0"
        >
          <Image src="/logos/logo.svg" alt="logo" width={28} height={28} />
          <span className="text-white font-bold text-xl">FLOWN</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-[108px] mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`h-10 px-4 flex items-center font-medium text-base text-white rounded-2xl transition-colors ${
                  isActive ? 'bg-[#1D3E75]' : 'hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측 */}
        <div className="flex items-center gap-[35px] flex-shrink-0">
          {/* 구분선 */}
          <div className="w-px h-6 bg-white/20" />

          {/* 알림 (빨간 점 배지) */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-colors">
            <Image
              src="/icons/bellIcon.svg"
              alt="알림"
              width={20}
              height={20}
            />
            <span
              className="absolute top-[7px] right-[7px] w-2 h-2 bg-[#EF4444] rounded-full"
              style={{ boxShadow: '0px 0px 0px 2px #2F5DAA' }}
            />
          </button>

          {/* 프로필 */}
          <Link
            href="/instructor/dashboard"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-base hover:bg-white/30 transition-colors"
          >
            김
          </Link>
        </div>
      </div>
    </header>
  );
}
