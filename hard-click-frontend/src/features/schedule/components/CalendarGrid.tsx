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
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7 text-center text-sm font-medium text-[#94A3B8]">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        {weeks.map((week) => {
          const segments = getWeekBarSegments(week, blocks);
          const rowCount = segments.reduce((max, segment) => Math.max(max, segment.row + 1), 0);
          const rows = Array.from({ length: rowCount }, (_, row) =>
            segments.filter((segment) => segment.row === row),
          );

          return (
            <div key={week[0].date} className="flex-1">
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
                {rows.map((rowSegments, row) => (
                  <div key={row} className="grid grid-cols-7">
                    {rowSegments.map((segment) => (
                      <div
                        key={segment.block.id}
                        className="mx-1 h-2 rounded-full"
                        style={{
                          gridColumn: `${segment.startCol} / span ${segment.span}`,
                          backgroundColor: categoryColor(segment.block.category).light,
                        }}
                      />
                    ))}
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
