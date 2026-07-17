'use client';

import { Fragment, useState } from 'react';
import type { ScheduleBlock, TodayTask } from '../types';
import { nextDateISO } from '../utils';
import { toast } from '@/lib/toast';
import {
  completeLessonAction,
  completeTodoAction,
  createTodoAction,
  updateTodoAction,
  deleteTodoAction,
} from '../actions';
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
 * 할 일 추가/체크/수정/삭제는 `../actions`의 Server Action으로 실서버에 반영하고, 성공 시에만 로컬 state를 갱신한다
 * (실패하면 토스트만 띄우고 이전 상태 유지 — 낙관적 업데이트 아님).
 * 완료 체크는 BE가 단방향(PLANNED→DONE)만 지원해 되돌릴 수 없다 — `TodayTaskChecklist`가 이미 완료된 항목은
 * 체크박스를 비활성화해 애초에 다시 누르지 못하게 막는다.
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
    const task = tasks.find((t) => t.id === id);
    if (!task || task.done) return;
    void (async () => {
      try {
        const action = task.source === 'LESSON' ? completeLessonAction : completeTodoAction;
        const result = await action(task.itemId);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: true } : t)));
      } catch {
        toast.error('완료 처리에 실패했어요. 다시 시도해주세요.');
      }
    })();
  };

  const addTask = async (input: NewTaskInput): Promise<boolean> => {
    try {
      const result = await createTodoAction({
        title: input.title,
        planDate: date,
        startTime: input.startTime,
        endTime: input.endTime,
      });
      if (!result.success || result.todoId == null) {
        toast.error(result.message);
        return false;
      }
      const todoId = result.todoId;
      setTasks((prev) => [
        ...prev,
        {
          id: `TODO-${todoId}`,
          itemId: todoId,
          source: 'TODO',
          title: input.title,
          done: false,
          category: 'OTHER',
          startTime: input.startTime,
          endTime: input.endTime,
        },
      ]);
      return true;
    } catch {
      toast.error('할 일 추가에 실패했어요. 다시 시도해주세요.');
      return false;
    }
  };

  const editTask = async (id: string, input: EditTaskInput): Promise<boolean> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return false;
    try {
      const result = await updateTodoAction(task.itemId, {
        title: input.title,
        planDate: date,
        startTime: input.startTime,
        endTime: input.endTime,
      });
      if (!result.success) {
        toast.error(result.message);
        return false;
      }
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, title: input.title, startTime: input.startTime, endTime: input.endTime } : t,
        ),
      );
      return true;
    } catch {
      toast.error('할 일 수정에 실패했어요. 다시 시도해주세요.');
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return false;
    try {
      const result = await deleteTodoAction(task.itemId);
      if (!result.success) {
        toast.error(result.message);
        return false;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch {
      toast.error('할 일 삭제에 실패했어요. 다시 시도해주세요.');
      return false;
    }
  };

  // 자정을 넘겨 다음날로 이어지는 할 일(끝 시간 <= 시작 시간)은 캘린더에도 오늘~다음날 막대로 보여준다.
  const overnightBlocks: ScheduleBlock[] = tasks
    .filter((t) => t.endTime <= t.startTime)
    .map((t) => ({ id: `overnight-${t.id}`, category: t.category, startDate: date, endDate: nextDateISO(date) }));
  const mergedBlocks = [...scheduleBlocks, ...overnightBlocks];

  return (
    <Fragment>
      <ScheduleCalendarCard year={year} month={month} blocks={mergedBlocks} className="lg:flex-1" />
      <div className="flex w-full flex-col gap-4 lg:w-[536px] lg:flex-none">
        <div className="flex min-h-0 flex-1 gap-4">
          <div className="w-full lg:w-[260px]">
            <TodayTaskPanel
              date={date}
              tasks={tasks}
              onToggle={toggleTask}
              onAdd={addTask}
              onEdit={editTask}
              onDelete={deleteTask}
            />
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
