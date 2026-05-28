'use client';

import { usePathname } from 'next/navigation';
import StudyTimerPanel from '@/features/studyTimers/components/StudyTimerPanel';
import UserHeader from '@/components/layout/headers/UserHeader';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // auth 페이지(/auth/*)는 자체 BrandLogo + 전체화면 레이아웃을 사용하므로 layout 헤더/타이머 제외
  const isAuthPage = pathname?.startsWith('/auth') ?? false;

  return (
    <>
      {!isAuthPage && <UserHeader />}
      {children}
      {!isAuthPage && <StudyTimerPanel />}
    </>
  );
}
