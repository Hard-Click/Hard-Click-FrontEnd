'use client';

import { useEffect, useRef, useState } from 'react';
import type { TodayTask } from '../types';

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

/** 네이티브 date input의 캘린더 팝업을 pill 클릭 한 번에 바로 연다(showPicker). */
function openPicker(input: HTMLInputElement | null) {
  input?.showPicker?.();
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** 끝 시간이 시작 시간보다 같거나 빠르면 다음날로 넘어간 것으로 보고 24시간을 더해 range로 만든다. */
function toRange(startTime: string, endTime: string): [number, number] {
  const s = toMinutes(startTime);
  let e = toMinutes(endTime);
  if (e <= s) e += 24 * 60;
  return [s, e];
}

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const [as, ae] = toRange(aStart, aEnd);
  const [bs, be] = toRange(bStart, bEnd);
  return as < be && ae > bs;
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_10 = ['00', '10', '20', '30', '40', '50'];

function TimePillField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hour, minute] = value ? value.split(':') : ['', ''];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="flex-1" ref={wrapperRef}>
      <p className="mb-1.5 text-xs text-[#94A3B8]">{label}</p>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-[#334155] ${
            error ? 'ring-1 ring-[#DC2626]' : ''
          } bg-[#F1F5F9]`}
        >
          {ClockIcon}
          {value || '시간 선택'}
        </button>
        {open && (
          <div className="absolute left-0 top-full z-20 mt-1 flex w-32 divide-x divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
            <div className="max-h-48 flex-1 overflow-y-auto p-1">
              {HOURS_24.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onChange(`${h}:${minute || '00'}`)}
                  className={`block w-full rounded-lg px-2 py-1.5 text-center text-sm ${
                    h === hour ? 'bg-[#2F5DAA]/10 font-semibold text-[#2F5DAA]' : 'text-[#334155] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="max-h-48 flex-1 overflow-y-auto p-1">
              {MINUTES_10.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange(`${hour || '00'}:${m}`)}
                  className={`block w-full rounded-lg px-2 py-1.5 text-center text-sm ${
                    m === minute ? 'bg-[#2F5DAA]/10 font-semibold text-[#2F5DAA]' : 'text-[#334155] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className={`mt-1 h-4 text-xs text-[#DC2626] ${error ? '' : 'invisible'}`}>{error || ' '}</p>
    </div>
  );
}

function DatePillField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1">
      <p className="mb-1.5 text-xs text-[#94A3B8]">{label}</p>
      <button
        type="button"
        onClick={() => openPicker(inputRef.current)}
        className="relative flex items-center gap-1.5 overflow-hidden rounded-full bg-[#F1F5F9] px-3 py-1.5 text-sm font-medium text-[#334155]"
      >
        {CalendarIcon}
        {formatPillDate(value)}
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          tabIndex={-1}
        />
      </button>
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
 * 시간은 24시간제, 시/분(10분 단위)을 따로 고른다. 끝 시간이 시작 시간보다 같거나 빠르면
 * 다음날 새벽까지 이어지는 일정으로 본다(예: 22:40~02:00) — 그래서 시작보다 늦어야 한다는 검증은 없다.
 * ⚠️ BE 저장 API 없음(2026-07-15 기준) — "저장"은 오늘 할 일 목록에 로컬로만 반영된다(새로고침하면 사라짐).
 */
export function AddTaskModal({
  existingTasks,
  onClose,
  onSave,
}: {
  existingTasks: readonly TodayTask[];
  onClose: () => void;
  onSave: (task: NewTaskInput) => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const timeOverlap =
    !!startTime &&
    !!endTime &&
    existingTasks.some((t) => rangesOverlap(startTime, endTime, t.startTime, t.endTime));
  const isValid = !!title.trim() && !!startTime && !!endTime && !timeOverlap;

  const titleError = submitted && !title.trim() ? '할 일을 입력해주세요.' : undefined;
  const startTimeError = submitted && !startTime ? '시작 시간을 입력해주세요.' : undefined;
  const endTimeError = submitted
    ? !endTime
      ? '끝나는 시간을 입력해주세요.'
      : timeOverlap
        ? '해당 시간에 이미 일정이 있어요.'
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
          <DatePillField label="날짜" value={date} onChange={setDate} />
        </div>

        <div className="mt-3.5 flex gap-2.5">
          <TimePillField label="시작 시간" value={startTime} onChange={setStartTime} error={startTimeError} />
          <TimePillField label="끝나는 시간" value={endTime} onChange={setEndTime} error={endTimeError} />
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
