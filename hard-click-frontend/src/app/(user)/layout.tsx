'use client';

import { usePathname } from 'next/navigation';
import StudyTimerPanel from '@/features/studyTimers/components/StudyTimerPanel';
import UserHeader from '@/components/layout/headers/UserHeader';
import InstructorHeader from '@/components/layout/headers/InstructorHeader';
import NotFoundView from '@/components/common/NotFoundView';
import { useAuth } from '@/features/auth/AuthProvider';

/** 비로그인 사용자 접근 허용 라우트 패턴 */
const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/auth(\/|$)/, // /auth/login, /auth/register 등
  /^\/courses(\/|$)/, // /courses, /courses/[id] 등
];

function isPublicRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return PUBLIC_ROUTE_PATTERNS.some((re) => re.test(pathname));
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth') ?? false;
  // 강의 시청 페이지(/learning/*)는 inline 타이머 위젯을 쓰므로 floating panel 제외
  const isLearningPage = pathname?.startsWith('/learning') ?? false;

  // 인증 상태는 서버(루트 layout의 getCurrentUser)가 쿠키로 계산해 Context로 내려줌
  const { isLoggedIn, role } = useAuth();

  // 비로그인 + 비공개 라우트 진입 시 401 표시 (직접 URL 입력 방어)
  const blocked = !isLoggedIn && !isPublicRoute(pathname);

  return (
    <>
      {!isAuthPage &&
        (role === 'INSTRUCTOR' ? <InstructorHeader /> : <UserHeader />)}
      {blocked ? <NotFoundView code="401" /> : children}
      {!isAuthPage && !isLearningPage && isLoggedIn && <StudyTimerPanel />}
    </>
  );
}
