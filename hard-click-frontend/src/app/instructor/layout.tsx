import InstructorHeader from '@/components/layout/headers/InstructorHeader';
import NotFoundView from '@/components/common/NotFoundView';
import { getCurrentUser } from '@/features/auth/session';

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /instructor/* 직접 URL 진입 방어 — 비로그인은 401, INSTRUCTOR가 아니면 403.
  // children(하위 페이지의 서버 조회)까지 막으려면 여기서 렌더 자체를 끊어야 한다.
  const user = await getCurrentUser();
  if (!user) return <NotFoundView code="401" />;
  if (user.role !== 'INSTRUCTOR') return <NotFoundView code="403" />;

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <InstructorHeader />

      <main>{children}</main>
    </div>
  );
}
