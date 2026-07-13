import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { getCurrentUser } from '@/features/auth/session';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { getNotificationsServer } from '@/features/notifications/server';
import { NotificationProvider } from '@/features/notifications/NotificationProvider';
import { getSubscriptionServer } from '@/features/subscriptions/server';
import { MemberStatusProvider } from '@/features/community/MemberStatusProvider';

// 전 페이지 기본 <title>·메타 설명 (PSI: 'title 요소 없음'·'메타 설명 없음' 지적 해소 → SEO·접근성)
// + Open Graph/Twitter 카드 — 카톡/슬랙/SNS에 링크 공유 시 제목·설명·이미지 미리보기 노출.
// 각 페이지는 template으로 자기 제목을 덮어쓸 수 있다.
// ⚠️ metadataBase = 실제 production 도메인. 다르면 og:image 절대경로가 틀어지니 배포 도메인으로 맞출 것.
const DESCRIPTION =
  'FLOWN에서 강의 수강부터 학습 기록 관리까지 한 번에. 체계적인 강의와 학습 타이머로 공부 습관을 만들어보세요.';
export const metadata: Metadata = {
  metadataBase: new URL('https://www.flown.site'),
  title: {
    default: 'FLOWN — 학습 흐름을 관리하는 가장 쉬운 방법',
    template: '%s | FLOWN',
  },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'FLOWN',
    title: 'FLOWN — 학습 흐름을 관리하는 가장 쉬운 방법',
    description: DESCRIPTION,
    locale: 'ko_KR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FLOWN' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLOWN — 학습 흐름을 관리하는 가장 쉬운 방법',
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 인증 정보는 서버에서 쿠키로 계산해 Context로 내려준다 (클라의 localStorage 대체)
  const user = await getCurrentUser();

  // 헤더 종 알림 + 구독 상태를 서버에서 받아 Context로 내려준다 (AuthProvider와 동일 패턴).
  // 로그인 사용자만 조회(병렬) → 비로그인은 빈 종·미구독. §12 "useEffect 데이터 페칭 금지" 준수.
  const [notifications, subscription] = user
    ? await Promise.all([getNotificationsServer(), getSubscriptionServer()])
    : [{ notifications: [], unreadCount: 0 }, null];

  return (
    <html lang="ko">
      <body>
        <AuthProvider
          value={{
            isLoggedIn: !!user,
            role: user?.role ?? null,
            memberId: user?.memberId ?? null,
            isSubscribed: subscription?.subscribed ?? false,
          }}
        >
          <NotificationProvider value={notifications}>
            <MemberStatusProvider>
              {children}
            </MemberStatusProvider>
          </NotificationProvider>
        </AuthProvider>

        <Toaster position="top-center" richColors offset={80} visibleToasts={3} />
      </body>
    </html>
  );
}
