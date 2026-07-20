import CourseList from '@/features/courses/components/CourseList';
import CourseListControls from '@/features/courses/components/CourseListControls';
import CourseNoticeBanner from '@/features/courses/components/CourseNoticeBanner';
import CoursesHero from '@/features/courses/components/CoursesHero';
import { getCoursesServer, getSubjectsServer } from '@/features/courses/server';
import { getInstructors } from '@/features/courses/services';
import { getRecentNoticesServer } from '@/features/notices/server';
import type { CourseSortType } from '@/features/courses/types';

interface AdminCoursesPageProps {
  searchParams: Promise<{
    keyword?: string;
    subjectId?: string;
    instructor?: string;
    sort?: string;
  }>;
}

export default async function AdminCoursesPage({
  searchParams,
}: AdminCoursesPageProps) {
  const sp = await searchParams;
  const keyword = sp.keyword ?? '';
  const subjectId = sp.subjectId ? Number(sp.subjectId) : undefined;
  const instructor = sp.instructor ?? '';
  const sort = (sp.sort as CourseSortType) ?? 'latest';

  const [courses, subjects, notices] = await Promise.all([
    getCoursesServer({
      keyword: keyword || undefined,
      subjectId,
      instructor: instructor || undefined,
      sort,
    }),
    getSubjectsServer(),
    getRecentNoticesServer(),
  ]);
  const instructors = getInstructors();

  const hasFilter = Boolean(keyword || subjectId || instructor);
  const status: 'empty' | 'no-results' | 'idle' =
    courses.length === 0 ? (hasFilter ? 'no-results' : 'empty') : 'idle';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 공지 배너 (client 잎사귀) */}
      <CourseNoticeBanner notices={notices} href="/admin/notices" />

      {/* 히어로 (공용) */}
      <CoursesHero />

      {/* 메인 콘텐츠 */}
      <div className="w-full max-w-[1440px] mx-auto px-8 pt-10 pb-16">
        <div className="mb-6">
          <h2 className="text-[#1F2937] font-bold text-3xl leading-9 mb-2">
            강의
          </h2>
          <p className="text-[#4B5563] text-base">원하는 강의를 찾아보세요.</p>
        </div>

        {/* 검색 + 필터 (client 잎사귀) */}
        <CourseListControls
          subjects={subjects}
          instructors={instructors}
          keyword={keyword}
          selectedSubjectId={subjectId}
          selectedInstructor={instructor}
          sort={sort}
        />

        {/* 강의 목록 (server) */}
        <CourseList
          courses={courses}
          status={status}
          hrefPrefix="/admin/courses/manage"
        />
      </div>
    </div>
  );
}
