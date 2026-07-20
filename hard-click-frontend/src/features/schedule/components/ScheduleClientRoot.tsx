'use client';

import { Fragment, useState } from 'react';
import type { ScheduleBlock, TodayTask } from '../types';
import { mergeScheduleBlocks, nextDateISO } from '../utils';
import { ScheduleCalendarCard } from './ScheduleCalendarCard';
import { TodayTaskPanel } from './TodayTaskPanel';
import { TodayTimeTable } from './TodayTimeTable';
import { AiCoachBanner } from './AiCoachBanner';
import type { NewTaskInput } from './AddTaskModal';
import type { EditTaskInput } from './EditTaskModal';

interface ScheduleClientRootProps {
  year: number;
  /** 0-indexed (1월=0) */
  month: number;
  date: string;
  initialTasks: readonly TodayTask[];
  scheduleBlocks: readonly ScheduleBlock[];
  aiCoachComment: string;
}

/**
 * 캘린더 + 오늘 할 일 + 타임테이블 + AI 코치를 함께 관리하는 client 루트.
 * 할 일 추가/체크 상태가 오늘 할 일·타임테이블뿐 아니라 캘린더에도 반영돼야 해서
 * (자정 넘어가는 할 일은 캘린더에도 다음날까지 회색 막대로 표시) 여기서 한 번에 들고 있는다.
 * ⚠️ BE 저장 API 없음(2026-07-15 기준) — 추가/체크는 이 세션에서만 유지된다.
 */
export function ScheduleClientRoot({
  year,
  month,
  date,
  initialTasks,
  scheduleBlocks,
  aiCoachComment,
}: ScheduleClientRootProps) {
  const [tasks, setTasks] = useState<readonly TodayTask[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = (input: NewTaskInput) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: input.title,
        done: false,
        category: 'OTHER',
        startTime: input.startTime,
        endTime: input.endTime,
      },
    ]);
  };

  const editTask = (id: string, input: EditTaskInput) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: input.title, startTime: input.startTime, endTime: input.endTime } : t)),
    );
  };

  // 자정을 넘겨 다음날로 이어지는 할 일(끝 시간 <= 시작 시간)은 캘린더에도 오늘~다음날 막대로 보여준다.
  const overnightBlocks: ScheduleBlock[] = tasks
    .filter((t) => t.endTime <= t.startTime)
    .map((t) => ({ id: `overnight-${t.id}`, category: t.category, startDate: date, endDate: nextDateISO(date) }));
  // 하루 단위 슬롯을 연속(같은 과목+같은 못함 여부) 구간으로 병합 — 날별로 쪼개진 막대를 한 막대로.
  const mergedBlocks = mergeScheduleBlocks([...scheduleBlocks, ...overnightBlocks]);

  return (
    <Fragment>
      <ScheduleCalendarCard year={year} month={month} blocks={mergedBlocks} className="lg:flex-1" />
      <div className="flex w-full flex-col gap-4 lg:w-[536px] lg:flex-none">
        <div className="flex min-h-0 flex-1 gap-4">
          <div className="w-full lg:w-[260px]">
            <TodayTaskPanel date={date} tasks={tasks} onToggle={toggleTask} onAdd={addTask} onEdit={editTask} />
          </div>
          <div className="w-full lg:w-[260px]">
            <TodayTimeTable tasks={tasks} />
          </div>
        </div>
        <AiCoachBanner comment={aiCoachComment} />
      </div>
    </Fragment>
  );
}
