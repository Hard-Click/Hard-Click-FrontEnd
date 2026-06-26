'use client';

export type NoticeTab = 'SYSTEM' | 'COURSE';

const TABS: { key: NoticeTab; label: string }[] = [
  { key: 'SYSTEM', label: '시스템 공지' },
  { key: 'COURSE', label: '강의 공지' },
];

interface AdminNoticeTabsProps {
  activeTab: NoticeTab;
  onTabChange: (tab: NoticeTab) => void;
}

export default function AdminNoticeTabs({
  activeTab,
  onTabChange,
}: AdminNoticeTabsProps) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-sm">
      <div className="grid grid-cols-2 gap-1">
        {TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={`h-11 rounded-2xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#2F5DAA] text-white'
                  : 'bg-white text-[#4B5563] hover:bg-[#F8FAFC]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
