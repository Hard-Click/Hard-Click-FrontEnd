// src/app/admin/reports/page.tsx
import Image from 'next/image';

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#EF4444]">
            <Image
              src="/icons/AdminReportFlag.svg"
              alt="신고 관리"
              width={36}
              height={36}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">신고 관리</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              접수된 신고를 검토하고 처리하세요.
            </p>
          </div>
        </div>

        {/* 필터 바 + 신고 목록 테이블 (후속 이슈에서 추가) */}
      </div>
    </div>
  );
}
