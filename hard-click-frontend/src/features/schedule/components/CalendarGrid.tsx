import { getMonthCalendarWeeks } from '../utils';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  year: number;
  /** 0-indexed (1월=0) */
  month: number;
}

export function CalendarGrid({ year, month }: CalendarGridProps) {
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
      <div className="flex flex-col gap-2">
        {weeks.map((week) => (
          <div key={week[0].date} className="grid grid-cols-7">
            {week.map((cell) => (
              <div key={cell.date} className="flex min-h-[100px] flex-col items-center gap-2 py-1">
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
                {/* 과목 학습바(주 단위로 여러 날짜에 걸쳐 겹쳐 그려짐)는 3단계(#818)에서 여기 아래 공간에 렌더링 */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
