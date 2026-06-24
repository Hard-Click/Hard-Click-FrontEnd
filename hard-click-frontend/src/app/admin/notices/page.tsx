export const dynamic = 'force-dynamic';

import AdminNoticeManage from '@/features/admin/components/AdminNoticeManage';
import { getAdminNoticesPageData } from '@/features/admin/server';

export default async function AdminNoticesPage() {
  const { notices, courses } = await getAdminNoticesPageData();

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <AdminNoticeManage notices={notices} courses={courses} />
      </div>
    </div>
  );
}
