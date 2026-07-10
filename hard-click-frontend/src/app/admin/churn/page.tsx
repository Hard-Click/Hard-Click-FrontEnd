import Image from 'next/image';
import { getChurnDashboardServer } from '@/features/churn/server';
import ChurnStatCards from '@/features/churn/components/ChurnStatCards';

export default async function AdminChurnPage() {
  // 서버에서 이탈 대시보드 데이터 확보 (현재 mock — BE 이탈 관리 API 미구현)
  const { stats } = await getChurnDashboardServer();

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
            <Image
              src="/icons/security.svg"
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

        {/* 추이 차트 · 주요 이탈 사유(2단계), 위험 학생 테이블(3단계) 후속 */}
      </div>
    </div>
  );
}
