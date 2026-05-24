import InstructorHeader from '@/components/layout/headers/InstructorHeader';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <InstructorHeader />

      <main>{children}</main>
    </div>
  );
}
