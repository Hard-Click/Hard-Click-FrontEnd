import './globals.css';
import { Toaster } from 'sonner';
import { getCurrentUser } from '@/features/auth/session';
import { AuthProvider } from '@/features/auth/AuthProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 인증 정보는 서버에서 쿠키로 계산해 Context로 내려준다 (클라의 localStorage 대체)
  const user = await getCurrentUser();

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
          {children}
        </AuthProvider>

        <Toaster position="top-center" richColors offset={80} />
      </body>
    </html>
  );
}
