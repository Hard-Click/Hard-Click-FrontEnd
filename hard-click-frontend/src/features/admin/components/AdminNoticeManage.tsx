'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import AdminNoticeTabs, { type NoticeTab } from './AdminNoticeTabs';
import AdminNoticeFilterBar from './AdminNoticeFilterBar';
import AdminNoticeTable from './AdminNoticeTable';
import AdminNoticeWriteButton from './AdminNoticeWriteButton';
import type { AdminNoticeRow, AdminCourseRow } from '@/mocks/admin.mock';

type NoticeFilter = 'ALL' | 'PINNED' | 'NORMAL';

const NOTICE_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'PINNED', label: '중요' },
  { key: 'NORMAL', label: '일반' },
];

interface Props {
  notices: AdminNoticeRow[];
  courses: AdminCourseRow[];
}

export default function AdminNoticeManage({ notices, courses }: Props) {
  const searchParams = useSearchParams();
  const autoOpen = searchParams.get('openWrite') === 'true';

  const [activeTab, setActiveTab] = useState<NoticeTab>('SYSTEM');
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<NoticeFilter>('ALL');

  const filtered = notices.filter((n) => {
    const matchTab =
      activeTab === 'SYSTEM' ? n.type === 'SYSTEM' : n.type === 'COURSE';
    const matchFilter =
      filter === 'ALL' || (filter === 'PINNED' ? n.isPinned : !n.isPinned);
    const matchKeyword = keyword ? n.title.includes(keyword) : true;
    return matchTab && matchFilter && matchKeyword;
  });

  return (
    <>
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
        <AdminNoticeWriteButton
          activeTab={activeTab}
          courses={courses}
          autoOpen={autoOpen}
        />
      </div>

      <div className="flex flex-col gap-6">
        <AdminNoticeTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <AdminNoticeFilterBar
          keyword={keyword}
          placeholder="공지 검색"
          onKeywordChange={setKeyword}
          tabs={NOTICE_TABS}
          activeTab={filter}
          onTabChange={(key) => setFilter(key as NoticeFilter)}
        >
          {activeTab === 'COURSE' && (
            <>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#475569]"
              >
                과목
                <Image
                  src="/icons/AdminDropDown.svg"
                  alt=""
                  width={14}
                  height={14}
                />
              </button>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#475569]"
              >
                강사
                <Image
                  src="/icons/AdminDropDown.svg"
                  alt=""
                  width={14}
                  height={14}
                />
              </button>
            </>
          )}
        </AdminNoticeFilterBar>
        <AdminNoticeTable notices={filtered} />
      </div>
    </>
  );
}
