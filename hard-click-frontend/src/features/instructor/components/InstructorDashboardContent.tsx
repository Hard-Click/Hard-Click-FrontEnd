import Image from 'next/image';
import RecentCourseSection from './RecentCourseSection';
import InstructorStatsCard from './InstructorStatsCard';

export default function InstructorDashboardContent() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      {/* 헤더 */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
          <Image
            src="/icons/dashboardIcon.svg"
            alt="dashboard"
            width={36}
            height={36}
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">강사 대시보드</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            강의와 수강생을 한눈에 관리하세요.
          </p>
        </div>
      </div>

      {/* 스탯 카드 */}
      <div className="mb-8">
        <InstructorStatsCard />
      </div>

      {/* 최근 등록 강의 */}
      <RecentCourseSection />
    </div>
  );
}
