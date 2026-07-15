import { Fragment } from 'react';
import { categoryColor, type SubjectCategory } from '@/features/courses/subjects';
import type { TodayTask } from '../types';
import { toMinutes } from '../utils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * 이 시간(정시~정시+1시간)에 걸쳐 있는 오늘 할 일의 과목(있으면). 10분 단위 시작/종료 시각 기준 겹침 판정.
 * 이 표는 "오늘" 하루(00~23시)만 그리므로, 끝 시간이 시작 시간보다 같거나 빠르면(예: 21:00~01:00)
 * 자정을 넘겨 다음날 새벽까지 이어지는 일정으로 보고 표의 맨 아래(23시)까지만 칠한다.
 * 표 위쪽 0~1시 칸은 "오늘"의 지난 새벽 시간이라, 다음날 새벽을 그 칸에 겹쳐 칠하면 안 된다.
 */
function categoryAtHour(hour: number, tasks: readonly TodayTask[]): SubjectCategory | null {
  const hourStart = hour * 60;
  const hourEnd = hourStart + 60;
  const task = tasks.find((t) => {
    const s = toMinutes(t.startTime);
    const e = toMinutes(t.endTime);
    if (e <= s) return s < hourEnd;
    return s < hourEnd && e > hourStart;
  });
  return task?.category ?? null;
}

/**
 * 오늘 타임테이블 — "오늘 할 일" 시간대를 그대로 시각화한 읽기 전용 하루 일정표.
 * 같은 과목이 이어지는 시간대는 경계선 없이 하나의 막대로 보이게 병합한다(AvailabilityGrid와 동일 기법).
 * 별도 입력/토글 없음 — 오늘 할 일 데이터에서 자동으로 계산된다.
 */
export function TodayTimeTable({ tasks }: { tasks: readonly TodayTask[] }) {
  const categories = HOURS.map((hour) => categoryAtHour(hour, tasks));

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white px-3 pb-6 pt-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Time Table</h2>
      <div className="mt-2 min-h-0 flex-1 overflow-hidden rounded-xl border border-[#E2E8F0]">
        <div className="grid h-full grid-cols-[52px_1fr] grid-rows-[repeat(24,minmax(0,1fr))]">
          {HOURS.map((hour) => {
            const category = categories[hour];
            const nextCategory = hour < 23 ? categories[hour + 1] : null;
            const mergesDown = category !== null && category === nextCategory;
            const color = category ? categoryColor(category).light : undefined;
            return (
              <Fragment key={hour}>
                <div className="flex items-center justify-end border-r border-[#E2E8F0] pr-2 text-[11px] text-[#94A3B8]">
                  {hourLabel(hour)}
                </div>
                <div className={`grid grid-cols-6 ${!mergesDown ? 'border-b border-[#E2E8F0]' : ''}`}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className={i < 5 && !color ? 'border-r border-[#EEF2F6]' : ''}
                      style={color ? { backgroundColor: color } : undefined}
                    />
                  ))}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
