'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getStudyTimeGrass, getLessonsGrass } from '@/features/grass/services';
import type { StudyTimeGrassCell, LessonsGrassCell } from '@/features/grass/types';

interface GrassYearlyModalProps {
  type: 'green' | 'orange';
  year?: number;
  onClose: () => void;
}

type CellData = { date: Date; level: number; value: string };

function cellIconSrc(type: 'green' | 'orange', level: number) {
  if (level === 0) return '/icons/grassEmpty.svg';
  return type === 'green' ? `/icons/grassGreen${level}.svg` : `/icons/grassOrange${level}.svg`;
}

/** API 응답을 연간 셀 데이터로 변환. 응답에 없는 날짜는 level 0. */
function apiToYearlyCells(
  type: 'green' | 'orange',
  year: number,
  apiData: (StudyTimeGrassCell | LessonsGrassCell)[],
): CellData[] {
  const lookup = new Map<string, StudyTimeGrassCell | LessonsGrassCell>();
  apiData.forEach((c) => lookup.set(c.date, c));
  const cells: CellData[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = formatDate(d);
    const apiCell = lookup.get(key);
    const level = Math.min(4, apiCell?.level ?? 0);
    const value = formatCellValue(type, apiCell);
    cells.push({ date: d, level, value });
  }
  return cells;
}

function formatCellValue(
  type: 'green' | 'orange',
  apiCell?: StudyTimeGrassCell | LessonsGrassCell,
): string {
  if (!apiCell) return type === 'green' ? '0개 강의' : '0분';
  if (type === 'green') {
    const count = (apiCell as LessonsGrassCell).watchedLessonCount ?? 0;
    return `${count}개 강의`;
  }
  const secs = (apiCell as StudyTimeGrassCell).studySeconds ?? 0;
  if (secs <= 0) return '0분';
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  return hours > 0 ? `${hours}시간 ${String(minutes).padStart(2, '0')}분` : `${minutes}분`;
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 기본값을 상수로 박으면 해가 바뀐 뒤 지난 해 잔디가 뜬다 → 호출 시점의 올해로.
export default function GrassYearlyModal({
  type,
  year = new Date().getFullYear(),
  onClose,
}: GrassYearlyModalProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [cells, setCells] = useState<CellData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const valueLabel = type === 'green' ? '수강량' : '순공시간';

  useEffect(() => {
    let cancelled = false;
    const fetcher =
      type === 'green' ? getLessonsGrass({ year }) : getStudyTimeGrass({ year });
    fetcher
      .then((res) => {
        if (cancelled) return;
        if (res.success) setCells(apiToYearlyCells(type, year, res.data));
        setLoaded(true); // 성공·실패 모두 로딩 종료 (실패 시 cells는 빈 채로)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [type, year]);

  // 로딩 중(스피너)·실패(빈 데이터) — 어느 경우든 backdrop 클릭으로 닫을 수 있게(이전엔 닫기 불가였음).
  if (cells.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        {loaded ? (
          <div
            className="rounded-2xl bg-white px-8 py-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-[#64748B]">연간 기록을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 rounded-lg bg-[#2F5DAA] px-4 py-1.5 text-sm font-semibold text-white"
            >
              닫기
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  const cardTitle = type === 'green' ? '강의 수 - 연간 기록' : '학습 시간 - 연간 기록';

  // 월요일 시작 기준 빈 셀 패딩
  const firstDayOfWeek = (cells[0].date.getDay() + 6) % 7;
  const paddedCells: (CellData | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...cells,
  ];

  // column-major: 각 col = 한 주 (7행)
  const weeks: (CellData | null)[][] = [];
  for (let i = 0; i < paddedCells.length; i += 7) {
    weeks.push(paddedCells.slice(i, i + 7));
  }

  // 월 라벨: 각 월 1일이 처음 등장하는 col 인덱스
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, colIdx) => {
    week.forEach((c) => {
      if (c && c.date.getDate() === 1 && c.date.getMonth() !== lastMonth) {
        monthLabels.push({ col: colIdx, label: `${c.date.getMonth() + 1}월` });
        lastMonth = c.date.getMonth();
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div
        className="w-full max-w-[1152px] my-auto bg-white rounded-2xl flex flex-col gap-6"
        style={{ padding: '32px 32px 32px' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold leading-8 text-[#1F2937]">학습 잔디</h2>
            <p className="text-base text-[#4B5563]">날짜별 수강량과 순공시간을 확인하세요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-2xl font-medium leading-8 text-[#4B5563] hover:text-[#1F2937]"
          >
            ✕
          </button>
        </div>

        {/* 잔디 카드 */}
        <div
          className="relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px]"
          style={{ padding: '33px' }}
        >
          {/* 카드 헤더 (중앙) */}
          <h3 className="mb-6 text-center text-xl font-bold text-[#1F2937]">{cardTitle}</h3>

          {/* 가운데 정렬 영역 */}
          <div className="flex justify-center">
            <div className="inline-flex flex-col gap-2">
              {/* 월 라벨 */}
              <div className="flex">
                <div className="w-4 mr-1" />
                <div className="flex gap-[3px]">
                  {weeks.map((_, colIdx) => {
                    const label = monthLabels.find((m) => m.col === colIdx)?.label;
                    return (
                      <div
                        key={colIdx}
                        className="w-[14px] text-xs leading-4 text-[#4B5563] whitespace-nowrap"
                      >
                        {label ?? ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 요일 라벨 + 셀 */}
              <div className="flex">
                <div className="flex w-4 flex-col gap-[3px] mr-1 text-right">
                  {['월', '', '수', '', '금', '', '일'].map((d, i) => (
                    <div
                      key={i}
                      className="h-[14px] leading-[14px] text-[9px] text-[#4B5563]"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="flex gap-[3px]">
                  {weeks.map((week, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-[3px]">
                      {week.map((c, rowIdx) => {
                        if (!c) {
                          return <div key={rowIdx} className="h-[14px] w-[14px]" />;
                        }
                        const key = formatDate(c.date);
                        const isHovered = hoveredKey === key;
                        return (
                          <div
                            key={rowIdx}
                            className={`relative h-[14px] w-[14px] rounded cursor-pointer transition-shadow ${
                              isHovered ? 'shadow-[0_0_0_2px_#1F2937CC] z-10' : ''
                            }`}
                            onMouseEnter={() => setHoveredKey(key)}
                            onMouseLeave={() => setHoveredKey(null)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cellIconSrc(type, c.level)}
                              width={14}
                              height={14}
                              alt=""
                              className="block h-full w-full"
                            />
                            {isHovered && (
                              <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 z-20 bg-[#1F2937CC] text-white px-3 py-1.5 rounded-[10px] whitespace-nowrap shadow-lg pointer-events-none">
                                <div className="text-[8px] font-bold leading-tight">{key}</div>
                                <div className="text-[6px] font-medium leading-tight mt-0.5">
                                  {valueLabel} : {c.value}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* 범례 (우측 정렬) */}
              <div className="mt-3 flex items-center justify-end gap-2 text-xs text-[#4B5563]">
                <span>적음</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((lv) => (
                    <Image
                      key={lv}
                      src={cellIconSrc(type, lv)}
                      alt=""
                      width={10}
                      height={10}
                      className="rounded-[2px]"
                    />
                  ))}
                </div>
                <span>많음</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
