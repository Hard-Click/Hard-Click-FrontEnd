'use client';

import { useState } from 'react';
import Image from 'next/image';
import AdminNoticeTabs, { type NoticeTab } from './AdminNoticeTabs';
import AdminNoticeFilterBar from './AdminNoticeFilterBar';
import AdminNoticeTable from './AdminNoticeTable';
import AdminNoticeWriteButton from './AdminNoticeWriteButton';
import type { AdminNoticeRow, AdminCourseRow } from '@/mocks/admin.mock';

interface AdminNoticeManageProps {
  notices: AdminNoticeRow[];
  courses: AdminCourseRow[];
}

export default function AdminNoticeManage({
  notices,
  courses,
}: AdminNoticeManageProps) {
  const [activeTab, setActiveTab] = useState<NoticeTab>('SYSTEM');
  const filteredNotices = notices.filter((n) =>
    activeTab === 'SYSTEM' ? n.type === 'SYSTEM' : n.type === 'COURSE'
  );
  return (
    <>
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

        <AdminNoticeWriteButton activeTab={activeTab} courses={courses} />
      </div>

      <div className="flex flex-col gap-6">
        <AdminNoticeTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <AdminNoticeFilterBar />
        <AdminNoticeTable notices={filteredNotices} />
      </div>
    </>
  );
}
