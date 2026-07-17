'use client';

import { useState } from 'react';
import type { TodayTask } from '../types';
import { rangesOverlap } from '../utils';
import { TimePillField } from './AddTaskModal';

export interface EditTaskInput {
  title: string;
  startTime: string;
  endTime: string;
}

/**
 * 오늘 할 일 수정 모달 (#884) — 체크박스가 아닌 항목 클릭 시 뜬다.
 * 기본은 보기 모드(취소/수정 버튼, 제목·시간 읽기 전용) — "수정" 클릭 시 편집 모드(취소/저장 버튼)로 전환되며
 * 그때부터 AddTaskModal과 동일한 제목 입력 + 시간 pill을 쓸 수 있다.
 * 시간 겹침 검증은 수정 대상 자기 자신을 제외한 나머지 오늘 할 일과만 비교한다(existingTasks가 그 목록).
 */
export function EditTaskModal({
  task,
  existingTasks,
  onClose,
  onSave,
  onDelete,
}: {
  task: TodayTask;
  existingTasks: readonly TodayTask[];
  onClose: () => void;
  /** 서버 저장 성공 시 true를 반환해야 모달이 닫힌다(실패 시 열린 채로 유지). */
  onSave: (input: EditTaskInput) => Promise<boolean>;
  /** 서버 삭제 성공 시 true를 반환해야 모달이 닫힌다. */
  onDelete: () => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [startTime, setStartTime] = useState(task.startTime);
  const [endTime, setEndTime] = useState(task.endTime);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sameTime = !!startTime && !!endTime && startTime === endTime;
  const timeOverlap =
    !!startTime &&
    !!endTime &&
    !sameTime &&
    existingTasks.some((t) => rangesOverlap(startTime, endTime, t.startTime, t.endTime));
  const isValid = !!title.trim() && !!startTime && !!endTime && !sameTime && !timeOverlap;

  const titleError = submitted && !title.trim() ? '할 일을 입력해주세요.' : undefined;
  const startTimeError = submitted && !startTime ? '시작 시간을 입력해주세요.' : undefined;
  const endTimeError = submitted
    ? !endTime
      ? '끝나는 시간을 입력해주세요.'
      : sameTime
        ? '시작 시간과 끝나는 시간이 같을 수 없어요.'
        : timeOverlap
          ? '해당 시간에 이미 일정이 있어요.'
          : undefined
    : undefined;

  const handlePrimary = async () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    setSubmitted(true);
    if (!isValid || isSaving) return;
    setIsSaving(true);
    try {
      const saved = await onSave({ title: title.trim(), startTime, endTime });
      if (saved) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const deleted = await onDelete();
      if (deleted) onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[380px] rounded-[20px] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="w-full text-[17px] font-medium text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
          />
        ) : (
          <p className="w-full text-[17px] font-medium text-[#1E293B]">{title}</p>
        )}
        <p className={`mt-1 h-4 text-xs text-[#DC2626] ${titleError ? '' : 'invisible'}`}>{titleError || ' '}</p>

        <div className="mt-4 flex gap-2.5">
          {editing ? (
            <>
              <TimePillField label="시작 시간" value={startTime} onChange={setStartTime} error={startTimeError} />
              <TimePillField label="끝나는 시간" value={endTime} onChange={setEndTime} error={endTimeError} />
            </>
          ) : (
            <div className="flex-1">
              <p className="mb-1.5 text-xs text-[#94A3B8]">시간</p>
              <p className="text-sm font-medium text-[#334155]">
                {startTime}-{endTime}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2.5 border-t border-[#E2E8F0] pt-3.5">
          {!editing && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="h-10 flex-1 rounded-[10px] border border-[#FCA5A5] bg-white text-sm font-medium text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-wait disabled:opacity-50"
            >
              {isDeleting ? '삭제 중…' : '삭제'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-10 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handlePrimary}
            className={`h-10 flex-1 rounded-[10px] bg-[#2F5DAA] text-sm font-medium text-white transition hover:bg-[#274C8B] disabled:cursor-wait ${
              editing && !isValid ? 'opacity-50' : ''
            }`}
          >
            {isSaving ? '저장 중…' : editing ? '저장' : '수정'}
          </button>
        </div>
      </div>
    </div>
  );
}
