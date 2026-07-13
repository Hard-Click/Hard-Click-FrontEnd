'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Pagination from '@/features/admin/components/Pagination';
import type { ChurnRiskLevel, ChurnStudent } from '../types';

const RISK_LABEL: Record<ChurnRiskLevel, string> = {
  HIGH: '고위험',
  MID: '중위험',
};

const RISK_STYLE: Record<ChurnRiskLevel, string> = {
  HIGH: 'bg-[#FEE2E2] text-[#DC2626]',
  MID: 'bg-[#FEF3C7] text-[#D97706]',
};

// 정렬 우선순위: 고위험 → 중위험
const RISK_ORDER: Record<ChurnRiskLevel, number> = { HIGH: 0, MID: 1 };

const PAGE_SIZE = 10;

/** 위험 학생 테이블 — 위험도 높은 순 정렬 + 페이지네이션 (client 섬). */
export default function ChurnStudentTable({
  students,
}: {
  students: ChurnStudent[];
}) {
  const [page, setPage] = useState(1);

  // 위험도 높은 순(고위험→중위험), 같은 등급이면 위험 점수 높은 순
  // students 참조가 바뀔 때만 재정렬 (page 변경 시 불필요한 재계산 방지)
  const sorted = useMemo(
    () =>
      [...students].sort(
        (a, b) =>
          RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel] ||
          b.riskScore - a.riskScore,
      ),
    [students],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      {/* 안내 문구 */}
      <p className="mb-5 flex items-center gap-1.5 text-sm text-[#64748B]">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E2E8F0] text-[11px] font-bold text-[#64748B]">
          i
        </span>
        위험도 높은 순으로 정렬되어 있습니다.
      </p>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] table-fixed">
          <colgroup>
            <col className="w-[11%]" />
            <col className="w-[14%]" />
            <col className="w-[22%]" />
            <col className="w-[11%]" />
            <col className="w-[21%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-sm text-[#94A3B8]">
              <th className="whitespace-nowrap px-4 py-3 font-medium">이름</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">아이디</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">메일</th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-medium">
                위험도
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">사유</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">
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
                  colSpan={7}
                  className="py-16 text-center text-sm text-[#94A3B8]"
                >
                  위험 학생이 없습니다.
                </td>
              </tr>
            ) : (
              paged.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[#F1F5F9] last:border-none hover:bg-[#F8FAFC]"
                >
                <td className="truncate px-4 py-4 text-sm font-semibold text-[#1E293B]">
                  {s.name}
                </td>
                <td className="truncate px-4 py-4 text-sm text-[#2F5DAA]">
                  {s.username}
                </td>
                <td className="truncate px-4 py-4 text-sm text-[#64748B]">
                  {s.email}
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      RISK_STYLE[s.riskLevel]
                    }`}
                  >
                    {RISK_LABEL[s.riskLevel]}
                  </span>
                </td>
                <td className="truncate px-4 py-4 text-sm text-[#475569]">
                  {s.reason}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-[#64748B]">
                  {s.lastActiveAt}
                </td>
                <td className="px-4 py-4 text-center">
                  <Link
                    href={`/admin/churn/${s.id}`}
                    className="inline-block whitespace-nowrap rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-sm font-medium text-[#2F5DAA] hover:bg-[#F8FAFC]"
                  >
                    확인하기
                  </Link>
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
