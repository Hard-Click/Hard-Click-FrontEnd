'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { getMyProfile } from '@/features/users/services';
import { logoutAction } from '@/features/auth/logout.actions';
import { clearSession } from '@/features/auth/session';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMemberStatus } from '@/features/community/MemberStatusProvider';
import NotificationDropdown from '@/features/notifications/components/NotificationDropdown';
import DoubleBtnModal from '@/components/ui/doubleButtonModal';

// match: href 외에 이 prefix들에서도 active 처리 (예: 공지는 강의 영역에서 진입)
const NAV_ITEMS: { label: string; href: string; match?: string[] }[] = [
  { label: '강의', href: '/courses', match: ['/notices'] },
  { label: '퀴즈', href: '/quizzes' },
  { label: '커뮤니티', href: '/community' },
  { label: '랭킹', href: '/rankings' },
  { label: '마이페이지', href: '/mypage' },
];

/** 비로그인 사용자에게 허용되는 메뉴 (그 외는 로그인 페이지로 이동) */
const PUBLIC_NAV_HREFS = new Set<string>(['/courses']);

const DROPDOWN_ITEMS = [
  { label: '찜한 강의', href: '/mypage/wishlist' },
  { label: '장바구니', href: '/cart' },
  { label: '결제 내역', href: '/orders' },
  { label: '구독권', href: '/subscriptions' },
];

export default function UserHeader() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const router = useRouter();
  // 인증 상태는 서버 쿠키 기반 Context에서 (localStorage 대체)
  const { isLoggedIn, isSubscribed } = useAuth();
  const { isSuspended, suspendedMessage } = useMemberStatus();

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

  // 라우트 변경 시 모바일 메뉴 닫기 (링크 외 이동·뒤로가기 대비)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // 비로그인 상태에선 /api/members/me를 호출하지 않는다.
    // (호출 시 401 → 전역 401 핸들러가 /auth/login으로 리다이렉트 → 공개 페이지 브라우징 차단)
    if (!isLoggedIn) return;
    // 로그아웃 직후 늦게 도착한 이전 응답이 상태를 덮어쓰지 않도록 가드
    let cancelled = false;
    const loadProfileImage = () => {
      getMyProfile().then((result) => {
        if (cancelled) return;
        setProfileImageUrl(
          result.success ? (result.data?.profileImageUrl ?? '') : '',
        );
      });
    };
    loadProfileImage();
    // 프로필 사진 변경(ProfileEditModal) 시 새로고침 없이 헤더 아바타 즉시 갱신
    window.addEventListener('profile-updated', loadProfileImage);
    return () => {
      cancelled = true;
      window.removeEventListener('profile-updated', loadProfileImage);
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsLogoutConfirmOpen(false);
    try {
      const result = await logoutAction();
      if (!result.success) {
        toast.error('로그아웃 처리 중 문제가 발생했어요. 기기를 안전하게 쓰려면 다시 시도해주세요.');
      }
    } catch {
      toast.error('로그아웃 처리 중 문제가 발생했어요. 기기를 안전하게 쓰려면 다시 시도해주세요.');
    }
    // 서버 무효화 성공 여부와 무관하게 이 브라우저의 세션 쿠키는 항상 지운다(로컬 기기는 즉시 정리).
    await clearSession();
    router.push('/courses');
    router.refresh();
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full h-16 bg-[#2F5DAA] shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.08)] flex-shrink-0">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 h-full flex justify-between md:grid md:grid-cols-[1fr_auto_1fr] items-center">
        {/* 로고 */}
        <Link href="/courses" className="flex items-center gap-3">
          <Image src="/logos/logo.svg" alt="logo" width={28} height={28} />
          <span className="text-white font-bold text-xl">FLOWN</span>
        </Link>

        {/* 네비게이션 — 모바일은 햄버거로 대체(hidden), md+에서 표시 */}
        <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-[60px]">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname.startsWith(item.href) ||
              (item.match?.some((m) => pathname.startsWith(m)) ?? false);
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              // 비로그인 + 비공개 메뉴 → 토스트만 (페이지 이동 X)
              if (!isLoggedIn && !PUBLIC_NAV_HREFS.has(item.href)) {
                e.preventDefault();
                toast.error('로그인이 필요합니다');
                return;
              }
              // 이용제한 계정 → 커뮤니티 진입 자체를 막고 토스트만
              if (item.href === '/community' && isSuspended) {
                e.preventDefault();
                toast.error(suspendedMessage ?? '커뮤니티 이용이 제한된 계정입니다.');
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
        <div className="flex items-center gap-3 md:gap-6 justify-end">
          {isLoggedIn ? (
            <>
              {/* 학습 스케줄 (패스 구독자 전용) — 알림 옆 캘린더 아이콘 */}
              {isSubscribed && (
                <Link
                  href="/schedule"
                  aria-label="학습 스케줄"
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 md:-mr-3"
                >
                  <Image
                    src="/icons/calendarIcon.svg"
                    alt="학습 스케줄"
                    width={21}
                    height={21}
                    className="brightness-0 invert"
                  />
                </Link>
              )}

              {/* 알림 */}
              <NotificationDropdown />

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
                      src="/icons/headerperson.svg"
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
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsLogoutConfirmOpen(true);
                      }}
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

          {/* 모바일 햄버거 — 로그인/프로필 오른쪽 끝에 붙임 */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 — 햄버거 토글 시 헤더 아래로 펼침 */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#2F5DAA] border-t border-white/10 shadow-lg">
          <nav className="flex flex-col px-4 py-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname.startsWith(item.href) ||
                (item.match?.some((m) => pathname.startsWith(m)) ?? false);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (!isLoggedIn && !PUBLIC_NAV_HREFS.has(item.href)) {
                      e.preventDefault();
                      toast.error('로그인이 필요합니다');
                    } else if (item.href === '/community' && isSuspended) {
                      e.preventDefault();
                      toast.error(suspendedMessage ?? '커뮤니티 이용이 제한된 계정입니다.');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-xl font-medium text-white transition-colors ${
                    isActive ? 'bg-[#1D3E75]' : 'hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>

    {isLogoutConfirmOpen && (
      <DoubleBtnModal
        title="로그아웃"
        description="정말 로그아웃 하시겠습니까?"
        leftText="취소"
        rightText="로그아웃"
        onLeftClick={() => setIsLogoutConfirmOpen(false)}
        onRightClick={handleLogout}
      />
    )}
    </>
  );
}
