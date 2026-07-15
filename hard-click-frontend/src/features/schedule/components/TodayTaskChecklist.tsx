'use client';

import { categoryColor } from '@/features/courses/subjects';
import type { TodayTask } from '../types';

interface TodayTaskChecklistProps {
  tasks: readonly TodayTask[];
  onToggle: (id: string) => void;
}

export function TodayTaskChecklist({ tasks, onToggle }: TodayTaskChecklistProps) {
  const doneCount = tasks.filter((task) => task.done).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="flex h-full flex-col">
      <ul className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <div className="flex w-full items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-left">
              <button
                type="button"
                onClick={() => onToggle(task.id)}
                aria-pressed={task.done}
                aria-label={task.done ? '완료 취소' : '완료로 표시'}
                className={
                  task.done
                    ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#2F5DAA] text-white'
                    : 'h-5 w-5 shrink-0 rounded-md border-2 border-[#CBD5E1]'
                }
              >
                {task.done && (
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span className="flex-1">
                <span
                  className={`block text-sm ${task.done ? 'text-[#94A3B8] line-through' : 'text-[#1E293B]'}`}
                >
                  {task.title}
                </span>
                <span className="mt-0.5 block text-xs text-[#94A3B8]">
                  {task.startTime}-{task.endTime}
                </span>
              </span>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: categoryColor(task.category).light }}
                aria-hidden
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#64748B]">오늘 진행률</span>
          <span className="font-semibold text-[#1E293B]">
            {doneCount}/{tasks.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-[#E2E8F0]">
          <div className="h-1.5 rounded-full bg-[#2F5DAA]" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
