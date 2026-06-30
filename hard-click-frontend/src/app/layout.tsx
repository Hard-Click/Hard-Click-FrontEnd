import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { getCurrentUser } from '@/features/auth/session';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { getNotificationsServer } from '@/features/notifications/server';
import { NotificationProvider } from '@/features/notifications/NotificationProvider';
import { MemberStatusProvider } from '@/features/community/MemberStatusProvider';

// 전 페이지 기본 <title>·메타 설명 (PSI: 'title 요소 없음'·'메타 설명 없음' 지적 해소 → SEO·접근성).
// 각 페이지는 template으로 자기 제목을 덮어쓸 수 있다.
export const metadata: Metadata = {
  title: {
    default: 'FLOWN — 학습 흐름을 관리하는 가장 쉬운 방법',
    template: '%s | FLOWN',
  },
  description:
    'FLOWN에서 강의 수강부터 학습 기록 관리까지 한 번에. 체계적인 강의와 학습 타이머로 공부 습관을 만들어보세요.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 인증 정보는 서버에서 쿠키로 계산해 Context로 내려준다 (클라의 localStorage 대체)
  const user = await getCurrentUser();

  // 헤더 종 알림도 서버에서 받아 Context로 내려준다 (AuthProvider와 동일 패턴).
  // 로그인 사용자만 조회 → 비로그인은 빈 종. §12 "useEffect 데이터 페칭 금지" 준수.
  const notifications = user
    ? await getNotificationsServer()
    : { notifications: [], unreadCount: 0 };

  return (
    <html lang="ko">
      <body>
        <AuthProvider
          value={{
            isLoggedIn: !!user,
            role: user?.role ?? null,
            memberId: user?.memberId ?? null,
          }}
        >
          <NotificationProvider value={notifications}>
            <MemberStatusProvider>
              {children}
            </MemberStatusProvider>
          </NotificationProvider>
        </AuthProvider>

        <Toaster position="top-center" richColors offset={80} />
      </body>
    </html>
  );
}
