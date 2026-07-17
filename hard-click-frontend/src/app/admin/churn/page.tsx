import Image from 'next/image';
import { getChurnSummaryServer, getChurnStudentsServer } from '@/features/churn/server';
import ChurnStatCards from '@/features/churn/components/ChurnStatCards';
import ChurnTrendChart from '@/features/churn/components/ChurnTrendChart';
import ChurnReasonBars from '@/features/churn/components/ChurnReasonBars';
import ChurnStudentTable from '@/features/churn/components/ChurnStudentTable';
import type { ChurnRiskLevel } from '@/features/churn/types';

export default async function AdminChurnPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; page?: string }>;
}) {
  const { level: levelParam, page: pageParam } = await searchParams;
  const level = levelParam === 'HIGH' || levelParam === 'MEDIUM' ? (levelParam as ChurnRiskLevel) : undefined;
  const page = Math.max(1, Math.trunc(Number(pageParam)) || 1);

  const [{ stats, trend, reasons }, studentsPage] = await Promise.all([
    getChurnSummaryServer(),
    getChurnStudentsServer(level, page),
  ]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
            <Image
              src="/icons/AdminReportFlag.svg"
              alt="이탈 관리"
              width={32}
              height={32}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">
              이탈관리 대시보드
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              FLOWN LMS 전체 현황을 관리하세요.
            </p>
          </div>
        </div>

        {/* 상단 지표 카드 */}
        <ChurnStatCards stats={stats} />

        {/* 추이 차트(좌, 넓게) · 주요 이탈 사유(우) */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChurnTrendChart data={trend} />
          </div>
          <ChurnReasonBars reasons={reasons} />
        </div>

        {/* 위험 학생 테이블 */}
        <ChurnStudentTable
          students={studentsPage.students}
          page={studentsPage.page}
          totalPages={studentsPage.totalPages}
          level={level}
        />
      </div>
    </div>
  );
}
