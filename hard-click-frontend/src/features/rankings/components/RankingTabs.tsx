import type { RankingTabType } from '../types';

const TABS: { key: RankingTabType; label: string }[] = [
  { key: 'studyTime', label: '순공 시간' },
  { key: 'lessonCount', label: '수강 횟수' },
  { key: 'acceptedCount', label: '채택 횟수' },
];

interface RankingTabsProps {
  activeTab: RankingTabType;
  onTabChange: (tab: RankingTabType) => void;
}

export default function RankingTabs({ activeTab, onTabChange }: RankingTabsProps) {
  return (
    <div className="flex gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-1 shadow-sm">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onTabChange(key)}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
            activeTab === key
              ? 'bg-[#2F5DAA] text-white shadow-sm'
              : 'text-[#4B5563] hover:bg-[#F8FAFC]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
