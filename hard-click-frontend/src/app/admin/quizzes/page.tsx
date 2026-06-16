import AdminQuizCourseManage from '@/features/admin/components/AdminQuizCourseManage';
import { mockAdminCourseManage } from '@/mocks/admin.mock';

export default function AdminQuizzesPage() {
  const courses = mockAdminCourseManage;

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">퀴즈 관리</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              강의별 퀴즈를 등록하고 관리하세요.
            </p>
          </div>
        </div>

        <AdminQuizCourseManage courses={courses} />
      </div>
    </div>
  );
}
