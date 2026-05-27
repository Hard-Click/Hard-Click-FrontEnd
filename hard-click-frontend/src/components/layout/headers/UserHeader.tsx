'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: '강의', href: '/courses' },
  { label: '커뮤니티', href: '/community' },
  { label: '랭킹', href: '/rankings' },
  { label: '마이페이지', href: '/mypage' },
];

export default function UserHeader() {
  const pathname = usePathname();

  return (
    <header className="w-full h-16 bg-[#2F5DAA] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] flex-shrink-0">
      <div className="w-full max-w-[1440px] mx-auto px-8 h-full flex items-center">

        {/* 로고 */}
        <Link href="/courses" className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logos/logo.svg" alt="logo" width={28} height={28} />
          <span className="text-white font-bold text-xl">FLOWN</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-[108px] mx-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
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

          {/* 위시리스트 */}
          <Link href="/mypage/wishlist" className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-colors">
            <Image src="/icons/heart.svg" alt="위시리스트" width={20} height={20} />
          </Link>

          {/* 장바구니 */}
          <Link href="/cart" className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-colors">
            <Image src="/icons/cart.svg" alt="장바구니" width={20} height={20} />
          </Link>

          {/* 알림 */}
          <Link href="/notifications" className="relative w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-colors">
            <Image src="/icons/bellIcon.svg" alt="알림" width={20} height={20} />
            <span className="absolute top-[-2px] left-[23px] min-w-[16px] h-4 bg-[#EF4444] rounded-full flex items-center justify-center px-[3px]">
              <span className="text-white font-bold text-[10px] leading-none">3</span>
            </span>
          </Link>

          {/* 프로필 */}
          <Link href="/mypage" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-base hover:bg-white/30 transition-colors">
            김
          </Link>
        </div>

      </div>
    </header>
  );
}
