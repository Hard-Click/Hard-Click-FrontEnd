import AdminHeader from '@/components/layout/headers/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <AdminHeader />

      <main>{children}</main>
    </div>
  );
}
