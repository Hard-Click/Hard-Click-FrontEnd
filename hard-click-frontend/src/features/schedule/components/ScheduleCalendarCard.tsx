import { formatMonthTitle } from '../utils';
import type { ScheduleBlock } from '../types';
import { CalendarGrid } from './CalendarGrid';
import { ScheduleLegend } from './ScheduleLegend';

interface ScheduleCalendarCardProps {
  year: number;
  /** 0-indexed (1월=0) */
  month: number;
  blocks?: readonly ScheduleBlock[];
}

export function ScheduleCalendarCard({ year, month, blocks }: ScheduleCalendarCardProps) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#1E293B]">{formatMonthTitle(year, month)}</h2>
        <ScheduleLegend />
      </div>
      <div className="mt-6">
        <CalendarGrid year={year} month={month} blocks={blocks} />
      </div>
    </div>
  );
}
