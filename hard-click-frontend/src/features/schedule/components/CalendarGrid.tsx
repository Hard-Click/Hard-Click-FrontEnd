import { categoryColor } from '@/features/courses/subjects';
import { getMonthCalendarWeeks } from '../utils';
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
        {weeks.map((week) => (
          // 주 행은 flex-1로 균등 고정 높이. 막대 스택은 각 "날짜 칸" 안에서만 스크롤되므로
          // 일정이 넘치는 날만 그 칸이 스크롤되고, 나머지 칸·달력 격자 높이는 그대로 유지된다.
          <div key={week[0].date} className="grid min-h-0 flex-1 grid-cols-7 gap-x-1">
            {week.map((cell) => {
              const isSelected = cell.date === selectedDate;
              // 하루 단위로 그 날에 걸치는 블록만 모은다(양끝 포함). BE는 하루 단위라 대개 그 날짜 블록들.
              const dayBlocks = blocks.filter(
                (block) => block.startDate <= cell.date && block.endDate >= cell.date,
              );
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
                <div key={cell.date} className="flex min-h-0 flex-col">
                  <div className="flex-none">
                    {onSelectDate && cell.inCurrentMonth ? (
                      // 클릭 영역을 숫자 원이 아니라 칸 전체로 넓힌다(A). 호버 배경은 두지 않는다(사용자 요청).
                      <button
                        type="button"
                        onClick={() => onSelectDate(cell.date)}
                        aria-pressed={isSelected}
                        aria-label={`${cell.date} 선택`}
                        className="flex w-full items-center justify-center rounded-lg py-1 transition"
                      >
                        <span className={dayClass}>{cell.day}</span>
                      </button>
                    ) : (
                      <div className="flex justify-center py-1">
                        <span className={dayClass}>{cell.day}</span>
                      </div>
                    )}
                  </div>
                  {/* 그 날의 학습 막대 — 넘치면 이 칸만 내부 스크롤(스크롤바 숨김). */}
                  <div className="scroll-hidden mt-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
                    {dayBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="h-2 flex-none rounded-full"
                        style={{ backgroundColor: categoryColor(block.category).light }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
