'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Pagination from '@/features/admin/components/Pagination';
import type { ChurnRiskLevel, ChurnStudent } from '../types';

const RISK_LABEL: Record<ChurnRiskLevel, string> = {
  HIGH: '고위험',
  MEDIUM: '중위험',
};

const RISK_STYLE: Record<ChurnRiskLevel, string> = {
  HIGH: 'bg-[#FEE2E2] text-[#DC2626]',
  MEDIUM: 'bg-[#FEF3C7] text-[#D97706]',
};

const RISK_ORDER: Record<ChurnRiskLevel, number> = { HIGH: 0, MEDIUM: 1 };

const LEVEL_TABS: { value: ChurnRiskLevel | undefined; label: string }[] = [
  { value: undefined, label: '전체' },
  { value: 'HIGH', label: '고위험' },
  { value: 'MEDIUM', label: '중위험' },
];

/**
 * 위험 학생 테이블 (client 섬) — 위험도 필터 탭 + 서버 페이지네이션.
 * 목록은 `/api/admin/churn/students?level=&page=&size=`가 서버에서 잘라 내려주므로,
 * 필터·페이지 이동은 URL 쿼리(`level`/`page`)를 바꿔 Server Component 재조회를 트리거한다
 * (클라에서 직접 fetch하지 않음 — Server-First 유지).
 */
export default function ChurnStudentTable({
  students,
  page,
  totalPages,
  level,
}: {
  students: ChurnStudent[];
  page: number;
  totalPages: number;
  level?: ChurnRiskLevel;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const pushQuery = (next: { level?: ChurnRiskLevel; page: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.level) params.set('level', next.level);
    else params.delete('level');
    params.set('page', String(next.page));
    startTransition(() => router.push(`/admin/churn?${params.toString()}`));
  };

  // 이 페이지에 내려온 항목만 위험도순 정렬(전체 데이터셋 정렬은 BE 응답 순서를 따름)
  const sorted = [...students].sort(
    (a, b) =>
      RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel] || b.riskScore - a.riskScore,
  );

  return (
    <div
      className={`mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-opacity ${isPending ? 'opacity-60' : ''}`}
    >
      {/* 위험도 필터 탭 */}
      <div className="mb-4 flex gap-2">
        {LEVEL_TABS.map((tab) => {
          const isActive = tab.value === level;
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={isActive}
              disabled={isPending}
              onClick={() => pushQuery({ level: tab.value, page: 1 })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition disabled:cursor-wait ${
                isActive
                  ? 'bg-[#2F5DAA] text-white'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 안내 문구 */}
      <p className="mb-5 flex items-center gap-1.5 text-sm text-[#64748B]">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E2E8F0] text-[11px] font-bold text-[#64748B]">
          i
        </span>
        이 페이지 항목은 위험도 높은 순으로 정렬되어 있습니다.
      </p>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col className="w-[32%]" />
            <col className="w-[18%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-sm text-[#94A3B8]">
              <th className="whitespace-nowrap px-4 py-3 font-medium">이름</th>
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
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-16 text-center text-sm text-[#94A3B8]"
                >
                  위험 학생이 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((s) => (
                <tr
                  key={s.enrollmentId}
                  className="border-b border-[#F1F5F9] last:border-none hover:bg-[#F8FAFC]"
                >
                  <td className="truncate px-4 py-4 text-sm font-semibold text-[#1E293B]">
                    {s.name}
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
                      href={`/admin/churn/${s.enrollmentId}`}
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
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => pushQuery({ level, page: p })}
        />
      </div>
    </div>
  );
}
