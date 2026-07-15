'use client';

import { Fragment, useState } from 'react';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
/** 00시~23시, 1시간 단위 24행 — 각 행은 다시 위/아래 반칸(30분 단위)으로 나뉜다. */
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}시`;
}

function halfLabel(hour: number, half: 0 | 1): string {
  return half === 0 ? `${hourLabel(hour)} 00분` : `${hourLabel(hour)} 30분`;
}

function cellKey(day: string, hour: number, half: 0 | 1): string {
  return `${day}-${hour}-${half}`;
}

/**
 * 불가능한 시간 체크 — 요일×시간대 그리드 (client 섬, #855).
 * 전체를 하나의 CSS grid로 그린다(행마다 별도 flex를 쓰면 컬럼 폭이 미세하게 어긋나 보임 — 반드시 단일 grid 유지).
 * 시간 라벨은 `row-span-2`로 두 반칸에 걸치고, 나머지 칸은 grid의 기본 auto-placement(행 우선, 이미 채워진
 * 칸은 건너뜀)에 맡긴다 — 그리드 위치를 칸마다 인라인 style로 지정하지 않아도 정확히 정렬된다.
 * 1시간 단위 24행, 각 행은 위/아래 반칸(30분 단위)으로 나뉘어 개별 토글된다.
 * 이어진 칸은 경계선 없이 하나의 막대로 이어 그린다(칸칸이 분리된 느낌 방지).
 * 기본은 전부 "가능"이고, 클릭/탭 또는 드래그로 지나간 칸이 "불가능"으로 토글된다.
 * 드래그 시작 칸의 반대 상태로 드래그 중 지나간 모든 칸을 맞춘다(칸마다 개별 토글 아님).
 * 마우스·터치는 Pointer Events로 통합 처리하고, 키보드는 Enter/Space로 단일 칸 토글한다.
 * "다음" 클릭 시 최근 모의고사 성적 입력 화면으로 이어진다(onNext, #857).
 */
export function AvailabilityGrid({ onNext }: { onNext: () => void }) {
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  // 드래그 중 여부와, 드래그가 지나가는 칸에 적용할 값(시작 칸의 반대 상태) — 이벤트 핸들러에서만 바뀐다.
  const [drag, setDrag] = useState<{ active: boolean; value: boolean }>({ active: false, value: false });

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
    setDrag({ active: true, value });
    applyToCell(key, value);
  };

  const enterDrag = (key: string) => {
    if (!drag.active) return;
    applyToCell(key, drag.value);
  };

  const endDrag = () => {
    if (drag.active) setDrag({ active: false, value: drag.value });
  };

  // 빠르게 드래그하면 작은 칸들 위에서 pointerenter가 일부 건너뛰어질 수 있어(브라우저가 프레임당 한 번만 판정)
  // 커서/손가락 바로 아래 요소를 직접 조회해 보정한다. 터치는 기본적으로 시작 요소가 포인터를 암묵 캡처해
  // move 이벤트가 다른 요소로 안 넘어가므로, 버튼 pointerdown에서 캡처를 해제해야 이 보정이 터치에서도 먹힌다.
  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (!drag.active) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const key = el?.dataset.cellKey;
    if (key) enterDrag(key);
  };

  const handleCellKeyDown = (key: string) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    applyToCell(key, !blocked.has(key));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      className="rounded-2xl border border-[#E2E8F0] bg-white p-8"
    >
      <h1 className="text-2xl font-bold text-[#1E293B]">불가능한 시간 체크</h1>
      <p className="mt-1 text-sm text-[#64748B]">
        체크한 시간대는 빼고 AI가 학습 일정을 짜드려요. 칸을 드래그하면 한 번에 여러 칸을 체크할 수 있어요(30분 단위).
      </p>

      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[560px] overflow-hidden rounded-xl border border-[#E2E8F0]">
          {/* 헤더(월~일) — 그리드 본문과 분리, 아래쪽에 구분선 */}
          <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div />
            {DAYS.map((day) => (
              <div key={day} className="py-2 text-center text-sm font-semibold text-[#334155]">
                {day}
              </div>
            ))}
          </div>

          {/* 시간대 그리드 본문 */}
          <div
            onPointerMove={handleContainerPointerMove}
            className="grid grid-cols-[48px_repeat(7,1fr)] select-none"
          >
            {HOURS.flatMap((hour) =>
              ([0, 1] as const).map((half) => {
                const blockedByDay = DAYS.map((day) => blocked.has(cellKey(day, hour, half)));
                return (
                  <Fragment key={`row-${hour}-${half}`}>
                    {half === 0 && (
                      <div className="row-span-2 flex items-center justify-end border-r border-[#E2E8F0] pr-2 text-[11px] text-[#94A3B8]">
                        {hourLabel(hour)}
                      </div>
                    )}
                    {DAYS.map((day, dayIndex) => {
                      const isBlocked = blockedByDay[dayIndex];
                      const mergesRight = dayIndex < 6 && isBlocked && blockedByDay[dayIndex + 1];
                      // 같은 요일의 바로 다음 30분 칸(정시 다음은 30분, 30분 다음은 다음 시 정시)도 막혀 있으면
                      // 그 사이 가로줄을 지운다 — 연속으로 체크한 구간이 시간 경계에서 끊겨 보이지 않도록.
                      const next = half === 0 ? { hour, half: 1 as const } : hour < 23 ? { hour: hour + 1, half: 0 as const } : null;
                      const mergesDown = !!next && isBlocked && blocked.has(cellKey(day, next.hour, next.half));
                      const key = cellKey(day, hour, half);
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={isBlocked}
                          aria-label={`${day}요일 ${halfLabel(hour, half)} ${isBlocked ? '불가능' : '가능'}`}
                          data-cell-key={key}
                          onPointerDown={(e) => {
                            e.currentTarget.releasePointerCapture(e.pointerId);
                            startDrag(key);
                          }}
                          onKeyDown={handleCellKeyDown(key)}
                          className={`h-[14px] transition-colors ${
                            isBlocked ? 'bg-[#94A3B8]' : 'bg-white hover:bg-[#F1F5F9]'
                          } ${dayIndex < 6 && !mergesRight ? 'border-r border-[#E2E8F0]' : ''} ${
                            !mergesDown ? 'border-b border-[#E2E8F0]' : ''
                          }`}
                        />
                      );
                    })}
                  </Fragment>
                );
              }),
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-5 text-sm text-[#475569]">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-md border border-[#E2E8F0] bg-white" />
          가능
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-md bg-[#94A3B8]" />
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
