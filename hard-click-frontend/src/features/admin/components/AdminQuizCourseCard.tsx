import Link from 'next/link';
import type { AdminCourseManageRow } from '@/mocks/admin.mock';

interface AdminQuizCourseCardProps {
  course: AdminCourseManageRow;
}

export default function AdminQuizCourseCard({
  course,
}: AdminQuizCourseCardProps) {
  const isPublic = course.status === 'PUBLISHED';

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] px-6 py-5">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-base font-bold text-[#1E293B]">{course.title}</h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isPublic
                ? 'bg-[#DCFCE7] text-[#16A34A]'
                : 'bg-[#FFF4E5] text-[#F97316]'
            }`}
          >
            {isPublic ? '공개' : '숨김'}
          </span>
        </div>
        <p className="text-sm text-[#64748B]">
          수강생 {course.studentCount}명 · 등록일: {course.createdAt} · 강사:{' '}
          {course.instructor}
        </p>
      </div>
      <Link
        href={`/admin/quizzes/${course.id}`}
        className="flex h-9 items-center whitespace-nowrap rounded-xl border border-[#E2E8F0] px-5 text-sm font-medium text-[#4B5563] transition hover:bg-[#F8FAFC]"
      >
        조회
      </Link>
    </div>
  );
}
