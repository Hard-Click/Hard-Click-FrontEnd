import { categoryColor } from '@/features/courses/subjects';
import { getMonthCalendarWeeks, getWeekBarSegments } from '../utils';
import type { ScheduleBlock } from '../types';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 못 한 학습(지난 날짜인데 완료 안 됨, BE가 MISSED로 마킹). 과목색 대신 이 검정 계열로 칠한다.
const MISSED_BAR_COLOR = '#1E293B';

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
                {segments.map((segment) => (
                  <div key={segment.block.id} className="grid grid-cols-7">
                    <div
                      className="mx-1 h-2 rounded-full"
                      style={{
                        gridColumn: `${segment.startCol} / span ${segment.span}`,
                        backgroundColor:
                          segment.block.status === 'MISSED'
                            ? MISSED_BAR_COLOR
                            : categoryColor(segment.block.category).light,
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
