import { categoryColor } from '@/features/courses/subjects';
import { getMonthCalendarWeeks, getWeekBarSegments } from '../utils';
import type { ScheduleBlock } from '../types';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  year: number;
  /** 0-indexed (1월=0) */
  month: number;
  blocks?: readonly ScheduleBlock[];
}

export function CalendarGrid({ year, month, blocks = [] }: CalendarGridProps) {
  const weeks = getMonthCalendarWeeks(year, month);

  return (
    <div>
      <div className="grid grid-cols-7 text-center text-sm font-medium text-[#94A3B8]">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {weeks.map((week) => {
          const segments = getWeekBarSegments(week, blocks);

          return (
            <div key={week[0].date} className="min-h-[56px]">
              <div className="grid grid-cols-7">
                {week.map((cell) => (
                  <div key={cell.date} className="flex justify-center py-1">
                    <span
                      className={
                        cell.isToday
                          ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[#1D4ED8] text-sm font-semibold text-white'
                          : `flex h-7 w-7 items-center justify-center text-sm ${
                              cell.inCurrentMonth ? 'text-[#1E293B]' : 'text-[#CBD5E1]'
                            }`
                      }
                    >
                      {cell.day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {segments.map((segment) => (
                  <div key={segment.block.id} className="grid grid-cols-7">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        gridColumn: `${segment.startCol} / span ${segment.span}`,
                        marginInline: '4px',
                        backgroundColor: categoryColor(segment.block.category).light,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
