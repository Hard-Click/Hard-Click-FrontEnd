import { categoryColor } from '@/features/courses/subjects';
import { getMonthCalendarWeeks, getWeekBarSegments } from '../utils';
import type { ScheduleBlock } from '../types';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  year: number;
  /** 0-indexed (1월=0) */
  month: number;
  blocks?: readonly ScheduleBlock[];
  /** 선택된 날짜(ISO). onSelectDate와 함께 줄 때만 의미 있음. */
  selectedDate?: string;
  /** 날짜 클릭 콜백(ISO). 없으면 기존처럼 보기 전용 — 함수 prop이라 서버 컴포넌트 사용처는 안 넘기면 된다. */
  onSelectDate?: (date: string) => void;
}

export function CalendarGrid({ year, month, blocks = [], selectedDate, onSelectDate }: CalendarGridProps) {
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
                {week.map((cell) => {
                  const isSelected = cell.date === selectedDate;
                  const dayClass = cell.isToday
                    ? `flex h-7 w-7 items-center justify-center rounded-full bg-[#1D4ED8] text-sm font-semibold text-white${
                        isSelected ? ' ring-2 ring-[#93C5FD]' : ''
                      }`
                    : isSelected
                      ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[#DBEAFE] text-sm font-semibold text-[#1D4ED8]'
                      : `flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                          cell.inCurrentMonth ? 'text-[#1E293B]' : 'text-[#CBD5E1]'
                        }`;
                  return (
                    <div key={cell.date} className="flex justify-center py-1">
                      {onSelectDate ? (
                        <button
                          type="button"
                          onClick={() => onSelectDate(cell.date)}
                          aria-pressed={isSelected}
                          aria-label={`${cell.date} 선택`}
                          className={`${dayClass} transition ${
                            !cell.isToday && !isSelected ? 'hover:bg-[#F1F5F9]' : ''
                          }`}
                        >
                          {cell.day}
                        </button>
                      ) : (
                        <span className={dayClass}>{cell.day}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {segments.map((segment) => (
                  <div key={segment.block.id} className="grid grid-cols-7">
                    <div
                      className="mx-1 h-2 rounded-full"
                      style={{
                        gridColumn: `${segment.startCol} / span ${segment.span}`,
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
