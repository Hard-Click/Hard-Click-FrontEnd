import { formatMonthTitle } from '../utils';
import type { ScheduleBlock } from '../types';
import { CalendarGrid } from './CalendarGrid';
import { ScheduleLegend } from './ScheduleLegend';

interface ScheduleCalendarCardProps {
  year: number;
  /** 0-indexed (1월=0) */
  month: number;
  blocks?: readonly ScheduleBlock[];
  /** 그리드 배치용(예: row-span) — 루트 div에 그대로 병합된다. */
  className?: string;
}

export function ScheduleCalendarCard({ year, month, blocks, className = '' }: ScheduleCalendarCardProps) {
  return (
    <div className={`flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#1E293B]">{formatMonthTitle(year, month)}</h2>
        <ScheduleLegend />
      </div>
      <div className="mt-4 min-h-0 flex-1">
        <CalendarGrid year={year} month={month} blocks={blocks} />
      </div>
    </div>
  );
}
