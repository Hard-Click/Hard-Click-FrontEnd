'use client';

import { useState } from 'react';
import { categoryColor, categoryLabel } from '@/features/courses/subjects';
import type { TodayTask } from '../types';
import { EditTaskModal, type EditTaskInput } from './EditTaskModal';
import { ReviewStartModal } from './ReviewStartModal';

interface TodayTaskChecklistProps {
  tasks: readonly TodayTask[];
  onToggle: (id: string) => void;
  onEdit: (id: string, input: EditTaskInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function TodayTaskChecklist({ tasks, onToggle, onEdit, onDelete }: TodayTaskChecklistProps) {
  const [editingTask, setEditingTask] = useState<TodayTask | null>(null);
  const [reviewTask, setReviewTask] = useState<TodayTask | null>(null);
  const doneCount = tasks.filter((task) => task.done).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="flex h-full flex-col">
      <ul className="scroll-slim flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-2">
        {tasks.map((task) => {
          // 복습 항목(source 'REVIEW' 또는 과목 '복습')은 수정이 아니라 복습 시작 확인 모달을 띄운다.
          // BE가 둘 중 어느 신호로 주든 인식되게 OR — subject가 실과목이어도 source로 잡아 조용히 일반 할 일로 새지 않게.
          const isReview = task.source === 'REVIEW' || task.category === 'REVIEW';
          // 수정 모달은 학생이 직접 추가한 TODO만 — LESSON(AI 슬롯)은 BE에 수정/삭제 API 자체가 없다.
          const editable = task.source === 'TODO' && !isReview;
          // 완료 체크는 BE가 단방향(PLANNED→DONE)만 지원 — 되돌리는 API가 없어 이미 완료면 체크박스 비활성화.
          const toggleLocked = isReview || task.done;
          const handleClick = editable
            ? () => setEditingTask(task)
            : isReview
              ? () => setReviewTask(task)
              : undefined;
          return (
          <li key={task.id}>
            <div
              onClick={handleClick}
              className={`flex w-full items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-left ${handleClick ? 'cursor-pointer' : ''}`}
            >
              <button
                type="button"
                disabled={toggleLocked}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(task.id);
                }}
                aria-pressed={task.done}
                aria-label={
                  isReview
                    ? '복습 퀴즈를 풀어야 완료 체크할 수 있어요'
                    : task.done
                      ? '완료됨(취소 불가)'
                      : '완료로 표시'
                }
                className={`${
                  task.done
                    ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#2F5DAA] text-white'
                    : 'h-5 w-5 shrink-0 rounded-md border-2 border-[#CBD5E1]'
                } ${toggleLocked ? 'cursor-not-allowed opacity-50' : ''}`}
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
                className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-[#1E293B]"
                style={{ backgroundColor: categoryColor(task.category).light }}
              >
                {categoryLabel(task.category)}
              </span>
            </div>
          </li>
          );
        })}
      </ul>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#64748B]">진행률</span>
          <span className="font-semibold text-[#1E293B]">
            {doneCount}/{tasks.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-[#E2E8F0]">
          <div className="h-1.5 rounded-full bg-[#2F5DAA]" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          existingTasks={tasks.filter((t) => t.id !== editingTask.id)}
          onClose={() => setEditingTask(null)}
          onSave={(input) => onEdit(editingTask.id, input)}
          onDelete={() => onDelete(editingTask.id)}
        />
      )}
      {reviewTask && <ReviewStartModal courseId={reviewTask.courseId} onClose={() => setReviewTask(null)} />}
    </div>
  );
}
