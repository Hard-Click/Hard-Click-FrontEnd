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

/** floating 순공 타이머(하단 중앙 고정)를 숨길 라우트.
 *  전용 레이아웃(learning=인라인 위젯 / chat=전체화면) + 하단 중앙 CTA를 타이머가 가리는
 *  focused 페이지(퀴즈 응시·해설 / 결제·결제결과 / 장바구니 / 구독권 / 학습 스케줄러). 브라우징·목록엔 그대로 띄운다. */
const TIMER_HIDDEN_PATTERNS: RegExp[] = [
  /^\/auth(\/|$)/,
  /^\/learning(\/|$)/,
  /^\/chat(\/|$)/,
  /^\/quizzes\/similar(\/|$)/, // 유사퀴즈 응시·결과(단일 라우트, 상태전환)
  /^\/quizzes\/[^/]+\/[^/]+/, // 응시·해설만 (진입 /quizzes·목록 /quizzes/{c}는 유지)
  /^\/checkout(\/|$)/,
  /^\/payment-result(\/|$)/,
  /^\/schedule(\/|$)/, // AI 코치 배너 등 하단 콘텐츠와 겹침
  /^\/cart(\/|$)/,
  /^\/subscriptions(\/|$)/,
  /^\/mypage\/wishlist(\/|$)/, // 찜 카드 하단 CTA(학습하기 등)를 타이머가 가림
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth') ?? false;
  // floating 순공 타이머를 숨길 라우트인지 (위 TIMER_HIDDEN_PATTERNS)
  const hideTimer = TIMER_HIDDEN_PATTERNS.some((re) => re.test(pathname ?? ''));

  // 인증 상태는 서버(루트 layout의 getCurrentUser)가 쿠키로 계산해 Context로 내려줌
  const { isLoggedIn, role } = useAuth();

  // 비로그인 + 비공개 라우트 진입 시 401 표시 (직접 URL 입력 방어)
  const blocked = !isLoggedIn && !isPublicRoute(pathname);

  return (
    <>
      {!isAuthPage &&
        (role === 'INSTRUCTOR' ? <InstructorHeader /> : <UserHeader />)}
      {blocked ? <NotFoundView code="401" /> : children}
      {!hideTimer && isLoggedIn && <StudyTimerPanel />}
    </>
  );
}
