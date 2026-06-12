import Image from 'next/image';
import AdminNoticeTabs from '@/features/admin/components/AdminNoticeTabs';
import AdminNoticeFilterBar from '@/features/admin/components/AdminNoticeFilterBar';
import AdminNoticeTable from '@/features/admin/components/AdminNoticeTable';
import { mockAdminNotices } from '@/mocks/admin.mock';
import AdminNoticeWriteButton from '@/features/admin/components/AdminNoticeWriteButton';

export default function AdminNoticesPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
              <Image
                src="/icons/bellIcon.svg"
                alt="notice"
                width={36}
                height={36}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">공지 관리</h1>
              <p className="mt-1 text-sm text-[#64748B]">
                공지사항을 관리하세요.
              </p>
            </div>
          </div>

          <AdminNoticeWriteButton />
        </div>

        <AdminNoticeTabs />
        <AdminNoticeFilterBar />

        <AdminNoticeTable notices={mockAdminNotices} />
      </div>
    </div>
  );
}
