'use client';

import Image from 'next/image';

interface Tab {
  key: string;
  label: string;
}

interface Props {
  keyword: string;
  placeholder?: string;
  onKeywordChange: (v: string) => void;
  onSearch?: () => void;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children?: React.ReactNode;
}

export default function AdminNoticeFilterBar({
  keyword,
  placeholder = '검색',
  onKeywordChange,
  onSearch,
  tabs,
  activeTab,
  onTabChange,
  children,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] px-4">
          <Image src="/icons/search.svg" alt="search" width={18} height={18} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder={placeholder}
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
          />
        </div>
        <button
          type="button"
          onClick={onSearch}
          className="h-11 rounded-2xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          검색
        </button>
        <div className="flex items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={`h-9 whitespace-nowrap rounded-[30px] px-4 text-sm font-semibold transition ${
                activeTab === t.key
                  ? 'bg-[#2F5DAA] text-white'
                  : 'bg-[#F1F5F9] text-[#475569]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {children && (
        <div className="mt-3 flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
