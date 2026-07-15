'use client';

import { useRef, useState } from 'react';

const CalendarIcon = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const ClockIcon = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatPillDate(dateStr: string): string {
  if (dateStr === todayISO()) return '오늘';
  const [, m, d] = dateStr.split('-');
  return `${Number(m)}/${Number(d)}`;
}

/** "HH:mm" → "오전/오후 h:mm" */
function formatPillTime(time: string): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
}

/** 네이티브 date/time input의 캘린더·시계 팝업을 pill 클릭 한 번에 바로 연다(showPicker). */
function openPicker(input: HTMLInputElement | null) {
  input?.showPicker?.();
}

function PillField({
  label,
  icon,
  displayValue,
  placeholder,
  type,
  value,
  onChange,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  displayValue: string | null;
  placeholder: string;
  type: 'date' | 'time';
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1">
      <p className="mb-1.5 text-xs text-[#94A3B8]">{label}</p>
      <button
        type="button"
        onClick={() => openPicker(inputRef.current)}
        className={`relative flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5 text-sm font-medium text-[#334155] ${
          error ? 'ring-1 ring-[#DC2626]' : ''
        } bg-[#F1F5F9]`}
      >
        {icon}
        {displayValue ?? placeholder}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          tabIndex={-1}
        />
      </button>
      <p className={`mt-1 h-4 text-xs text-[#DC2626] ${error ? '' : 'invisible'}`}>{error || ' '}</p>
    </div>
  );
}

export interface NewTaskInput {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * 할 일 추가 모달 (client 섬, #876) — 제목 + 날짜 + 시작/끝 시간만 입력(과목 선택 없음).
 * 날짜·시간 pill은 네이티브 input을 투명하게 겹쳐두고, 클릭 시 `showPicker()`로 바로 캘린더/시계를 띄운다.
 * ⚠️ BE 저장 API 없음(2026-07-15 기준) — "저장"은 오늘 할 일 목록에 로컬로만 반영된다(새로고침하면 사라짐).
 */
export function AddTaskModal({ onClose, onSave }: { onClose: () => void; onSave: (task: NewTaskInput) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const timeOrderInvalid = !!startTime && !!endTime && endTime <= startTime;
  const isValid = !!title.trim() && !!startTime && !!endTime && !timeOrderInvalid;

  const titleError = submitted && !title.trim() ? '할 일을 입력해주세요.' : undefined;
  const startTimeError = submitted && !startTime ? '시작 시간을 입력해주세요.' : undefined;
  const endTimeError = submitted
    ? !endTime
      ? '끝나는 시간을 입력해주세요.'
      : timeOrderInvalid
        ? '끝나는 시간은 시작 시간보다 늦어야 해요.'
        : undefined
    : undefined;

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) return;
    onSave({ title: title.trim(), date, startTime, endTime });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[380px] rounded-[20px] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
          className="w-full text-[17px] font-medium text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
        />
        <p className={`mt-1 h-4 text-xs text-[#DC2626] ${titleError ? '' : 'invisible'}`}>{titleError || ' '}</p>

        <div className="mt-4 flex">
          <PillField
            label="날짜"
            icon={CalendarIcon}
            displayValue={formatPillDate(date)}
            placeholder="날짜 선택"
            type="date"
            value={date}
            onChange={setDate}
          />
        </div>

        <div className="mt-3.5 flex gap-2.5">
          <PillField
            label="시작 시간"
            icon={ClockIcon}
            displayValue={formatPillTime(startTime)}
            placeholder="시간 선택"
            type="time"
            value={startTime}
            onChange={setStartTime}
            error={startTimeError}
          />
          <PillField
            label="끝나는 시간"
            icon={ClockIcon}
            displayValue={formatPillTime(endTime)}
            placeholder="시간 선택"
            type="time"
            value={endTime}
            onChange={setEndTime}
            error={endTimeError}
          />
        </div>

        <div className="mt-5 flex gap-2.5 border-t border-[#E2E8F0] pt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`h-10 flex-1 rounded-[10px] bg-[#2F5DAA] text-sm font-medium text-white transition hover:bg-[#274C8B] ${
              isValid ? '' : 'opacity-50'
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
