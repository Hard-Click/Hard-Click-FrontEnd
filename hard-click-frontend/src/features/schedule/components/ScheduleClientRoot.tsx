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
  getTasksForDateAction,
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
 * 캘린더 날짜 클릭 → 그 날짜 항목을 재조회해 투두/타임테이블을 전환한다(초기값 = 오늘).
 * 조회 실패 시 날짜를 바꾸지 않고 이전 화면 유지(빈 목록으로 위장하지 않음, §0.1④).
 * 추가/수정의 planDate도 선택 날짜를 따른다 — 다른 날짜를 보며 추가하면 그 날짜의 할 일이 된다.
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
  const [selectedDate, setSelectedDate] = useState(date);
  const [dateLoading, setDateLoading] = useState(false);

  const selectDate = (next: string) => {
    if (next === selectedDate || dateLoading) return;
    void (async () => {
      setDateLoading(true);
      try {
        const result = await getTasksForDateAction(next);
        if (!result.success || !result.tasks) {
          toast.error(result.message);
          return;
        }
        setSelectedDate(next);
        setTasks(result.tasks);
      } catch {
        toast.error('해당 날짜 조회에 실패했어요. 다시 시도해주세요.');
      } finally {
        setDateLoading(false);
      }
    })();
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.done) return;
    // REVIEW엔 완료 API가 없다 — 체크박스 잠금(TodayTaskChecklist)에 더해 쓰기 경로도 source로 방어.
    if (task.source === 'REVIEW') return;
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
        planDate: selectedDate,
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
        planDate: selectedDate,
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

  // 자정을 넘겨 다음날로 이어지는 할 일(끝 시간 <= 시작 시간)은 캘린더에도 선택 날짜~다음날 막대로 보여준다.
  // 시간이 없는 항목(예: 시간 미지정 REVIEW)은 '' < ''가 false로 걸러진다. 끝==시작(0분)은 자정 넘김이 아니므로 strict <.
  const overnightBlocks: ScheduleBlock[] = tasks
    .filter((t) => t.startTime !== '' && t.endTime !== '' && t.endTime < t.startTime)
    .map((t) => ({
      id: `overnight-${t.id}`,
      category: t.category,
      startDate: selectedDate,
      endDate: nextDateISO(selectedDate),
    }));
  const mergedBlocks = [...scheduleBlocks, ...overnightBlocks];

  return (
    <Fragment>
      <ScheduleCalendarCard
        year={year}
        month={month}
        blocks={mergedBlocks}
        className="lg:flex-1"
        selectedDate={selectedDate}
        onSelectDate={selectDate}
      />
      <div className="flex w-full flex-col gap-4 lg:w-[536px] lg:flex-none">
        <div className="flex min-h-0 flex-1 gap-4">
          <div className="w-full lg:w-[260px]">
            <TodayTaskPanel
              date={selectedDate}
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
