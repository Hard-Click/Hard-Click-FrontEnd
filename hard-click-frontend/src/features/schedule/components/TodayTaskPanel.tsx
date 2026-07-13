import { formatShortDateWithWeekday } from '../utils';
import type { TodayTask } from '../types';
import { TodayTaskChecklist } from './TodayTaskChecklist';

interface TodayTaskPanelProps {
  date: string;
  tasks: readonly TodayTask[];
}

export function TodayTaskPanel({ date, tasks }: TodayTaskPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-[#1E293B]">오늘 할 일</h2>
        <span className="text-sm text-[#94A3B8]">{formatShortDateWithWeekday(new Date(date))}</span>
      </div>

      <div className="mt-4 flex-1">
        <TodayTaskChecklist tasks={tasks} />
      </div>
    </div>
  );
}
