'use client';

import { useState } from 'react';
import Image from 'next/image';
import SelectDropdown from '@/components/ui/SelectDropdown';
import { scoreBucket } from '../scoreboard';
import type { QuizScoreRow } from '../types';

const SORT_OPTIONS = [
  { label: '점수 높은순', value: 'scoreDesc' },
  { label: '점수 낮은순', value: 'scoreAsc' },
  { label: '이름순', value: 'name' },
];
const ATTEND_OPTIONS = [
  { label: '전체', value: 'all' },
  { label: '응시', value: 'attended' },
  { label: '미응시', value: 'notAttended' },
];

/**
 * 수강생 목록 — 검색 + 정렬(점수↑/↓·이름) + 응시여부 필터(전체/응시/미응시) + 표.
 * 정렬·필터·검색은 클라이언트 파생값(상호작용 leaf). 데이터는 page에서 props로.
 */
export default function QuizScoresTable({ rows }: { rows: QuizScoreRow[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('scoreDesc');
  const [attend, setAttend] = useState('all');

  const term = search.trim().toLowerCase();
  const visible = rows
    .filter((r) =>
      attend === 'all' ? true : attend === 'attended' ? r.attended : !r.attended,
    )
    .filter(
      (r) =>
        !term ||
        r.name.toLowerCase().includes(term) ||
        r.studentId.toLowerCase().includes(term),
    )
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ko');
      // 점수 정렬 — 미응시(점수 없음)는 항상 맨 아래
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return sort === 'scoreAsc' ? a.score - b.score : b.score - a.score;
    });

  return (
    <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_5px_rgba(0,0,0,0.06)]">
      {/* 헤더: 제목 + 검색 + 정렬 + 응시여부 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-6 py-4">
        <h2 className="text-base font-bold text-[#1F2937]">수강생 목록</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Image
              src="/icons/searchIcon.svg"
              alt=""
              width={16}
              height={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 또는 아이디 검색"
              aria-label="수강생 이름 또는 아이디 검색"
              className="h-10 w-[220px] rounded-2xl border border-[#E2E8F0] pl-9 pr-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-colors focus:border-[#2F5DAA] focus:outline-none"
            />
          </div>
          <SelectDropdown placeholder="정렬" value={sort} options={SORT_OPTIONS} onChange={setSort} />
          <SelectDropdown placeholder="응시여부" value={attend} options={ATTEND_OPTIONS} onChange={setAttend} />
        </div>
      </div>

      {/* 표 */}
      <table className="w-full table-fixed text-center [&_td]:align-middle [&_th]:align-middle">
        <colgroup>
          <col className="w-[25%]" />
          <col className="w-[15%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-sm font-semibold text-[#64748B]">
            <th scope="col" className="py-4">아이디</th>
            <th scope="col" className="py-4">이름</th>
            <th scope="col" className="py-4">응시 여부</th>
            <th scope="col" className="py-4">점수</th>
            <th scope="col" className="py-4">제출일</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#9CA3AF]">
                검색 결과가 없습니다.
              </td>
            </tr>
          ) : (
            visible.map((r) => {
              const bucket = scoreBucket(r.score);
              return (
                <tr key={r.studentId} className="border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-[#F8FAFC]">
                  <td className="py-4 text-sm font-medium text-[#4B5563]">{r.studentId}</td>
                  <td className="py-4 text-base font-semibold text-[#1F2937]">{r.name}</td>
                  <td className="py-4">
                    {r.attended ? (
                      <span className="inline-flex items-center rounded-2xl bg-[rgba(47,93,170,0.1)] px-3 py-1 text-sm font-semibold text-[#2F5DAA]">
                        응시
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-2xl bg-[#F1F5F9] px-3 py-1 text-sm font-semibold text-[#9CA3AF]">
                        미응시
                      </span>
                    )}
                  </td>
                  <td className="py-4">
                    {r.score === null || !bucket ? (
                      <span className="text-sm text-[#CBD5E1]">-</span>
                    ) : (
                      <span
                        className="inline-flex items-center rounded-2xl px-3 py-1 text-sm font-bold"
                        style={{ background: `${bucket.color}1a`, color: bucket.color }}
                      >
                        {r.score}점
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-sm text-[#4B5563]">
                    {r.submittedDate ?? <span className="text-[#CBD5E1]">-</span>}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </section>
  );
}
