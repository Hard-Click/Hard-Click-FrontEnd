export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import AdminCourseManage from '@/features/admin/components/AdminCourseManage';
import { fetchAllAdminCourses } from '@/features/admin/server';

export default async function AdminCourseManagePage() {
  const courses = await fetchAllAdminCourses();

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
              <Image
                src="/icons/quickAction2.svg"
                alt="강의 관리"
                width={36}
                height={36}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">강의 관리</h1>
              <p className="mt-1 text-sm text-[#64748B]">
                등록한 강의를 관리하고 수정하세요.
              </p>
            </div>
          </div>
          <Link
            href="/admin/courses/manage/new"
            className="flex h-11 items-center gap-2 rounded-xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            <span className="text-lg leading-none">+</span>
            강의 등록
          </Link>
        </div>
        <AdminCourseManage initialCourses={courses} />
      </div>
    </div>
  );
}
