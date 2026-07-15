'use client';

import { useState } from 'react';
import type { TodayTask } from '../types';
import { TodayTaskPanel } from './TodayTaskPanel';
import { TodayTimeTable } from './TodayTimeTable';
import type { NewTaskInput } from './AddTaskModal';

/**
 * "오늘 할 일" + "타임테이블" 묶음 (client 섬) — 둘 다 같은 할 일 목록을 공유해야 해서
 * (할 일 추가/체크가 타임테이블에도 바로 반영) 상태를 이 레벨에서 들고 내려준다.
 * ⚠️ BE 저장 API 없음(2026-07-15 기준) — 추가/체크는 이 세션에서만 유지되고 새로고침하면 초기값으로 돌아간다.
 */
export function TodayScheduleGroup({
  date,
  initialTasks,
}: {
  date: string;
  initialTasks: readonly TodayTask[];
}) {
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
        category: 'REVIEW',
        startTime: input.startTime,
        endTime: input.endTime,
      },
    ]);
  };

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="w-full lg:w-[260px]">
        <TodayTaskPanel date={date} tasks={tasks} onToggle={toggleTask} onAdd={addTask} />
      </div>
      <div className="w-full lg:w-[260px]">
        <TodayTimeTable tasks={tasks} />
      </div>
    </div>
  );
}
