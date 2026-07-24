import { categoryColor } from '@/features/courses/subjects';
import { getMonthCalendarWeeks, getWeekBarSegments } from '../utils';
import type { ScheduleBlock } from '../types';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// startCol·span은 1~7로 고정 — 정적 클래스 문자열이라야 Tailwind가 스캔·생성한다.
// (`col-start-${n}` 같은 런타임 조합은 purge에 걸려 CSS가 안 나오므로 인덱스 룩업으로 둔다.)
const COL_START_CLASS = ['', 'col-start-1', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'];
const COL_SPAN_CLASS = ['', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-7'];

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
          const rowCount = segments.reduce((max, segment) => Math.max(max, segment.row + 1), 0);
          const rows = Array.from({ length: rowCount }, (_, row) =>
            segments.filter((segment) => segment.row === row),
          );

          return (
            // 주 행은 고정 높이(flex-1 균등)로 두고, 막대가 많은 날은 내부 스크롤로 흡수한다.
            // min-h-0 이 있어야 자식(막대 스택)이 넘칠 때 행이 늘어나지 않고 스크롤로 넘어간다.
            <div key={week[0].date} className="flex min-h-0 flex-1 flex-col">
              <div className="grid flex-none grid-cols-7">
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
                    <div key={cell.date}>
                      {onSelectDate && cell.inCurrentMonth ? (
                        // 클릭 영역을 숫자 원이 아니라 칸 전체로 넓힌다(A). 호버 배경은 두지 않는다(사용자 요청).
                        // 오늘/선택 표시는 안쪽 span(dayClass)의 원이 그대로 유지한다.
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
                  );
                })}
              </div>
              <div className="scroll-hidden mt-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
                {rows.map((rowSegments, row) => (
                  <div key={row} className="grid grid-cols-7">
                    {rowSegments.map((segment) => (
                      <div
                        key={segment.block.id}
                        className={`mx-1 h-2 rounded-full ${COL_START_CLASS[segment.startCol]} ${COL_SPAN_CLASS[segment.span]}`}
                        style={{ backgroundColor: categoryColor(segment.block.category).light }}
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
