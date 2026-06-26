'use client';

import { useRouter } from 'next/navigation';
import type { RankingPeriod } from '../types';

const PERIODS: { key: RankingPeriod; label: string }[] = [
  { key: 'daily', label: '일간' },
  { key: 'weekly', label: '주간' },
  { key: 'monthly', label: '월간' },
];

/**
 * 기간 선택 (일간/주간/월간) — URL `?period=`로 밀어넣으면 서버 페이지가 해당 period로 재조회.
 * (BE는 daily/weekly/monthly만 지원 — 연간 없음. §12: client에서 직접 fetch 안 하고 URL 구동.)
 */
export default function RankingPeriodTabs({
  period,
}: {
  period: RankingPeriod;
}) {
  const router = useRouter();
  return (
    <div className="flex justify-center gap-2">
      {PERIODS.map(({ key, label }) => {
        const active = period === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => router.push(`/rankings?period=${key}`, { scroll: false })}
            className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
              active
                ? 'bg-[#2F5DAA] text-white shadow-sm'
                : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
