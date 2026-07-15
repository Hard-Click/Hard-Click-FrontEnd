'use client';

import { useState } from 'react';
import type { TodayTask } from '../types';
import { AddTaskModal, type NewTaskInput } from './AddTaskModal';

/** 할 일 추가 버튼 (client 섬) — 클릭 시 날짜·시작/끝 시간을 고를 수 있는 추가 모달을 띄운다. */
export function AddTaskButton({
  tasks,
  onAdd,
}: {
  tasks: readonly TodayTask[];
  onAdd: (task: NewTaskInput) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-lg border border-[#2F5DAA]/30 px-2.5 py-1 text-sm font-semibold text-[#2F5DAA] transition hover:bg-[#F0F5FF]"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        할 일 추가
      </button>
      {open && <AddTaskModal existingTasks={tasks} onClose={() => setOpen(false)} onSave={onAdd} />}
    </>
  );
}
