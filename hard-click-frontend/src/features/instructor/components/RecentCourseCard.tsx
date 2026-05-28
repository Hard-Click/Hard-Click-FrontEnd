import Link from 'next/link';

interface RecentCourseCardProps {
  courseId: number;
  title: string;
  isPublic: boolean;
  students: number;
  createdAt: string;
}

export default function RecentCourseCard({
  courseId,
  title,
  isPublic,
  students,
  createdAt,
}: RecentCourseCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white px-6 py-5">
      {/* left */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-xl font-bold text-[#1E293B]">{title}</h3>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              isPublic
                ? 'bg-[#EAF7EE] text-[#16A34A]'
                : 'bg-[#FFF4E5] text-[#F97316]'
            }`}
          >
            {isPublic ? '공개' : '숨김'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#64748B]">
          <p>수강생 {students}명</p>
          <span>•</span>
          <p>등록일: {createdAt}</p>
        </div>
      </div>

      {/* button */}
      <Link href={`/instructor/courses/${courseId}`}>
        <button
          type="button"
          className="rounded-xl border border-[#E2E8F0] px-5 py-2 text-sm font-medium text-[#4B5563] transition hover:bg-[#F8FAFC]"
        >
          관리
        </button>
      </Link>
    </div>
  );
}
