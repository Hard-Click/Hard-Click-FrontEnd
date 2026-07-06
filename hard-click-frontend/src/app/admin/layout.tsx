import AdminHeader from '@/components/layout/headers/AdminHeader';
import NotFoundView from '@/components/common/NotFoundView';
import { getCurrentUser } from '@/features/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /admin/* 직접 URL 진입 방어 — 비로그인은 401, ADMIN이 아니면 403.
  // children(하위 페이지의 서버 조회)까지 막으려면 여기서 렌더 자체를 끊어야 한다.
  const user = await getCurrentUser();
  if (!user) return <NotFoundView code="401" />;
  if (user.role !== 'ADMIN') return <NotFoundView code="403" />;

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <AdminHeader />

      <main>{children}</main>
    </div>
  );
}
