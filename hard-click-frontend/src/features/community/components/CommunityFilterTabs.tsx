'use client';

import { useState } from 'react';

const FILTERS = ['전체', '자유게시판', '질문게시판', '스터디모집'];

export default function CommunityFilterTabs() {
  const [activeTab, setActiveTab] = useState('전체');
  return (
    <div className="overflow-hidden border border-[#E2E8F0] rounded-[16px] bg-white p-1 shadow-sm">
      <div className="grid grid-cols-4 gap-1">
        {FILTERS.map((filter) => {
          const isActive = activeTab === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveTab(filter)}
              className={`h-11 rounded-[20px] text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#2F5DAA] text-white shadow-sm'
                  : 'bg-white text-[#4B5563] hover:bg-[#F8FAFC]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
