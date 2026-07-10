'use client';

import { useState } from 'react';
import Pagination from '@/features/admin/components/Pagination';
import type { ChurnRiskLevel, ChurnStudent } from '../types';

type ChurnFilter = 'ALL' | ChurnRiskLevel;

const FILTERS: { value: ChurnFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'HIGH', label: '고위험' },
  { value: 'MID', label: '중위험' },
];

const RISK_LABEL: Record<ChurnRiskLevel, string> = {
  HIGH: '고위험',
  MID: '중위험',
};

const RISK_STYLE: Record<ChurnRiskLevel, string> = {
  HIGH: 'bg-[#FEE2E2] text-[#DC2626]',
  MID: 'bg-[#FEF3C7] text-[#D97706]',
};

const PAGE_SIZE = 10;

// 점수 구간별 색: 35 미만 검정 / 35~70 노랑 / 70 이상 빨강
function scoreColor(score: number): string {
  if (score >= 70) return 'text-[#DC2626]';
  if (score >= 35) return 'text-[#D97706]';
  return 'text-[#1E293B]';
}

/** 위험 학생 테이블 — 필터탭 + 테이블 + 페이지네이션 (유일한 use client 섬). */
export default function ChurnStudentTable({
  students,
}: {
  students: ChurnStudent[];
}) {
  const [filter, setFilter] = useState<ChurnFilter>('ALL');
  const [page, setPage] = useState(1);

  const filtered =
    filter === 'ALL'
      ? students
      : students.filter((s) => s.riskLevel === filter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // 필터 변경 시 첫 페이지로 (set-state-in-effect 룰 회피 — 핸들러에서 리셋)
  const handleFilter = (value: ChurnFilter) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      {/* 필터탭 */}
      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilter(f.value)}
              className={`h-10 rounded-xl px-5 text-sm font-semibold transition ${
                active
                  ? 'border border-[#2F5DAA] text-[#2F5DAA]'
                  : 'border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] table-fixed ">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-sm text-[#94A3B8]">
              <th className="whitespace-nowrap px-4 py-3 font-medium">이름</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">
                아이디
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">메일</th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-medium">
                위험도
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">사유</th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-medium">
                점수
              </th>
              <th className="whitespace-nowrap px-6 py-3  font-medium ">
                최근 활동
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-medium">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-16 text-center text-sm text-[#94A3B8]"
                >
                  해당하는 학생이 없습니다.
                </td>
              </tr>
            ) : (
              paged.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[#F1F5F9] last:border-none hover:bg-[#F8FAFC]"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-[#1E293B]">
                    {s.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#2F5DAA]">
                    {s.username}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#64748B]">
                    {s.email}
                  </td>
                  <td className="px-11 py-4">
                    <span
                      className={`inline-block whitespace-nowrap text-center rounded-full px-3 py-1 text-xs  font-semibold ${
                        RISK_STYLE[s.riskLevel]
                      }`}
                    >
                      {RISK_LABEL[s.riskLevel]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#475569]">
                    {s.reason}
                  </td>
                  <td
                    className={`px-4 py-4 text-center text-sm font-bold ${scoreColor(
                      s.riskScore,
                    )}`}
                  >
                    {s.riskScore}점
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#64748B]">
                    {s.lastActiveAt}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {/* TODO: 학생 상세/조치 라우트 연동 (BE 미구현) */}
                    <button
                      type="button"
                      className="whitespace-nowrap text-sm font-medium text-[#2F5DAA] rounded-lg border border-[#E2E8F0] px-3 py-1.5 hover:bg-[#F8FAFC] disabled:opacity-50"
                    >
                      확인하기
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
