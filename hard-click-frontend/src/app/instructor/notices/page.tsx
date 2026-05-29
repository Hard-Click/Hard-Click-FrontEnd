import Image from 'next/image';
import InstructorNoticeTable from '@/features/instructor/components/InstructorNoticeTable';

export default function InstructorNoticesPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
            <Image
              src="/icons/noticeAlarm.svg"
              alt="notice"
              width={24}
              height={24}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">
              강의 공지 관리
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              본인 강의의 공지사항을 관리하세요
            </p>
          </div>
        </div>

        <InstructorNoticeTable />
      </div>
    </div>
  );
}
