import './globals.css';
import { Toaster } from 'sonner';
import { getCurrentUser } from '@/features/auth/session';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { getNotificationsServer } from '@/features/notifications/server';
import { NotificationProvider } from '@/features/notifications/NotificationProvider';

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
            {children}
          </NotificationProvider>
        </AuthProvider>

        <Toaster position="top-center" richColors offset={80} />
      </body>
    </html>
  );
}
