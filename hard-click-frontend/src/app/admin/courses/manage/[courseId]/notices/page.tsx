import Image from 'next/image';
import Link from 'next/link';
import AdminNoticeTable from '@/features/admin/components/AdminNoticeTable';
import AdminCourseNoticeWriteButton from '@/features/admin/components/AdminCourseNoticeWriteButton';
import { getCourseDetailServer } from '@/features/courses/server';
import { mockAdminNotices } from '@/mocks/admin.mock';

export default async function AdminCourseNoticesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseDetailServer(Number(courseId));
  const courseTitle = course?.title ?? '강의';

  // 해당 강의 공지만 필터 (mock)
  const notices = mockAdminNotices.filter((n) => n.type === 'COURSE');

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#2F5DAA]">
            <Image
              src="/icons/bellIcon.svg"
              alt="notice"
              width={28}
              height={28}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">
              강의 공지사항 - {courseTitle}
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              중요한 소식과 업데이트를 확인하세요.
            </p>
          </div>
        </div>

        {/* 강의로 돌아가기 + 공지 작성 */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/admin/courses/manage/${courseId}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#4B5563] hover:text-[#2F5DAA]"
          >
            <Image src="/icons/back.svg" alt="back" width={16} height={16} />
            강의로 돌아가기
          </Link>
          <AdminCourseNoticeWriteButton courseTitle={courseTitle} />
        </div>

        {/* 공지 목록 테이블 */}
        <AdminNoticeTable
          notices={notices}
          detailBasePath={`/admin/courses/manage/${courseId}/notices`}
        />
      </div>
    </div>
  );
}
