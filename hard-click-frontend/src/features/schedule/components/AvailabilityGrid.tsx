'use client';

import { Fragment, useRef, useState } from 'react';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
/** 00시~22시, 2시간 단위 12행 */
const HOURS = Array.from({ length: 12 }, (_, i) => i * 2);

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}시`;
}

function cellKey(day: string, hour: number): string {
  return `${day}-${hour}`;
}

/**
 * 불가능한 시간 체크 — 요일×시간대 그리드 (client 섬, #855).
 * 기본은 전부 "가능"이고, 클릭 또는 드래그로 지나간 칸이 "불가능"으로 토글된다.
 * 드래그 시작 칸의 반대 상태로 드래그 중 지나간 모든 칸을 맞춘다(칸마다 개별 토글 아님).
 * "다음" 클릭 시 최근 모의고사 성적 입력 화면으로 이어진다(onNext, #857).
 */
export function AvailabilityGrid({ onNext }: { onNext: () => void }) {
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const draggingRef = useRef(false);
  const dragValueRef = useRef(false);

  const applyToCell = (key: string, value: boolean) => {
    setBlocked((prev) => {
      const has = prev.has(key);
      if (has === value) return prev;
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const startDrag = (key: string) => {
    const value = !blocked.has(key);
    draggingRef.current = true;
    dragValueRef.current = value;
    applyToCell(key, value);
  };

  const enterDrag = (key: string) => {
    if (!draggingRef.current) return;
    applyToCell(key, dragValueRef.current);
  };

  const endDrag = () => {
    draggingRef.current = false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      className="rounded-2xl border border-[#E2E8F0] bg-white p-8"
    >
      <h1 className="text-2xl font-bold text-[#1E293B]">불가능한 시간 체크</h1>
      <p className="mt-1 text-sm text-[#64748B]">
        체크한 시간대는 빼고 AI가 학습 일정을 짜드려요. 칸을 드래그하면 한 번에 여러 칸을 체크할 수 있어요.
      </p>

      <div className="mt-8 overflow-x-auto">
        <div className="grid min-w-[640px] select-none grid-cols-[48px_repeat(7,1fr)] gap-1.5">
          <div />
          {DAYS.map((day) => (
            <div key={day} className="pb-1 text-center text-sm font-semibold text-[#334155]">
              {day}
            </div>
          ))}

          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <div className="flex items-center justify-end pr-2 text-xs text-[#94A3B8]">
                {hourLabel(hour)}
              </div>
              {DAYS.map((day) => {
                const key = cellKey(day, hour);
                const isBlocked = blocked.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isBlocked}
                    aria-label={`${day}요일 ${hourLabel(hour)} ${isBlocked ? '불가능' : '가능'}`}
                    onMouseDown={() => startDrag(key)}
                    onMouseEnter={() => enterDrag(key)}
                    className={`h-9 rounded-lg border transition-colors ${
                      isBlocked
                        ? 'border-[#CBD5E1] bg-[#CBD5E1]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8] hover:bg-[#F1F5F9]'
                    }`}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-5 text-sm text-[#475569]">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-md border border-[#E2E8F0] bg-white" />
          가능
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-md bg-[#CBD5E1]" />
          불가능
        </span>
      </div>

      <div className="mt-8 border-t border-[#E2E8F0] pt-6">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2F5DAA] text-sm font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] transition hover:bg-[#274C8B]"
        >
          다음
        </button>
      </div>
    </form>
  );
}
