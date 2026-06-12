import AdminNoticeManage from '@/features/admin/components/AdminNoticeManage';
import { mockAdminNotices, mockAdminCourses } from '@/mocks/admin.mock';

export default function AdminNoticesPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <AdminNoticeManage
          notices={mockAdminNotices}
          courses={mockAdminCourses}
        />
      </div>
    </div>
  );
}
