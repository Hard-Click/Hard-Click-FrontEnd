'use client';

import dynamic from 'next/dynamic';
import type { ChurnTrendPoint } from '../types';

// recharts는 무거우니 dynamic import(ssr:false)로 코드 스플리팅 — 초기 번들 보호(§13)
const ChurnTrendChartView = dynamic(() => import('./ChurnTrendChartView'), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
  ),
});

/** 이탈 위험 학생 추이 카드 (client leaf — 차트만 client). */
export default function ChurnTrendChart({
  data,
}: {
  data: ChurnTrendPoint[];
}) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm [&_*:focus-visible]:outline-none [&_*:focus]:outline-none">
      <h2 className="text-xl font-bold text-[#1E293B]">이탈 위험 학생 추이</h2>
      <p className="mb-4 text-sm text-[#94A3B8]">최근 8주 · 고위험 학생 수</p>
      <ChurnTrendChartView data={data} />
    </div>
  );
}
