'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { getMyProfile } from '@/features/users/services';
import { authStore } from '@/store/auth.store';
import { logout } from '@/features/auth/services';

const NAV_ITEMS = [
  { label: '강의', href: '/courses' },
  { label: '커뮤니티', href: '/community' },
  { label: '랭킹', href: '/rankings' },
  { label: '마이페이지', href: '/mypage' },
];

/** 비로그인 사용자에게 허용되는 메뉴 (그 외는 로그인 페이지로 이동) */
const PUBLIC_NAV_HREFS = new Set<string>(['/courses']);

const DROPDOWN_ITEMS = [
  { label: '찜한 강의', href: '/mypage/wishlist' },
  { label: '장바구니', href: '/cart' },
  { label: '결제 내역', href: '/mypage/orders' },
];

export default function UserHeader() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 외부 클릭 시 드롭다운 닫기
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

  useEffect(() => {
    getMyProfile().then((result) => {
      if (result.success && result.data?.profileImageUrl) {
        setProfileImageUrl(result.data.profileImageUrl);
      }
    });
  }, []);

  useEffect(() => {
    setIsLoggedIn(authStore.isLoggedIn());
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    authStore.clear();
    setIsLoggedIn(false);
    router.push('/courses');
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[#2F5DAA] shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.08)] flex-shrink-0">
      <div className="w-full max-w-[1440px] mx-auto px-8 h-full grid grid-cols-3 items-center">
        {/* 로고 */}
        <Link href="/courses" className="flex items-center gap-3">
          <Image src="/logos/logo.svg" alt="logo" width={28} height={28} />
          <span className="text-white font-bold text-xl">FLOWN</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center justify-center gap-[60px]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              // 비로그인 + 비공개 메뉴 → 토스트만 (페이지 이동 X)
              if (!isLoggedIn && !PUBLIC_NAV_HREFS.has(item.href)) {
                e.preventDefault();
                toast.error('로그인이 필요합니다');
              }
            };
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClick}
                className={`h-10 px-4 flex items-center font-medium text-base text-white rounded-2xl transition-colors whitespace-nowrap ${
                  isActive ? 'bg-[#1D3E75]' : 'hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측 - 프로필 */}
        <div className="flex items-center gap-6 justify-end">
          {isLoggedIn ? (
            <>
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

              {/* 프로필 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/30 transition-colors overflow-hidden"
                >
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt="프로필"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Image
                      src="/icons/headerPerson.svg"
                      alt="프로필"
                      width={28}
                      height={28}
                    />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 w-[160px] rounded-2xl border border-[#E2E8F0] bg-white shadow-lg overflow-hidden z-50">
                    {DROPDOWN_ITEMS.map((item, index) => (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsDropdownOpen(false)}
                          className="block w-full px-5 py-4 text-sm text-center text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                        >
                          {item.label}
                        </Link>
                        {index < DROPDOWN_ITEMS.length - 1 && (
                          <div className="h-px bg-[#E2E8F0]" />
                        )}
                      </div>
                    ))}
                    <div className="h-px bg-[#E2E8F0]" />
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
            </>
          ) : (
            /* 비로그인 */
            <Link
              href="/auth/login"
              className="h-9 px-5 flex items-center rounded-2xl bg-white text-[#2F5DAA] text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
