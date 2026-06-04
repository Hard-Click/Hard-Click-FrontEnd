import CourseList from '@/features/courses/components/CourseList';
import CourseListControls from '@/features/courses/components/CourseListControls';
import CourseNoticeBanner from '@/features/courses/components/CourseNoticeBanner';
import { getCoursesServer, getSubjectsServer } from '@/features/courses/server';
import { getInstructors } from '@/features/courses/services';
import { getPinnedNoticesServer } from '@/features/notices/server';
import type { CourseSortType } from '@/features/courses/types';

interface CoursesPageProps {
  // Next.js 15+ : searchParams 는 Promise
  searchParams: Promise<{
    keyword?: string;
    subjectId?: string;
    instructor?: string;
    sort?: string;
  }>;
}

// Server Component: 데이터를 서버에서 가져와 렌더 (useEffect 없음)
export default async function CoursesPage({ searchParams }: CoursesPageProps) {
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
    getPinnedNoticesServer(),
  ]);
  const instructors = getInstructors();

  const hasFilter = Boolean(keyword || subjectId || instructor);
  const status: 'empty' | 'no-results' | 'idle' =
    courses.length === 0 ? (hasFilter ? 'no-results' : 'empty') : 'idle';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 공지 배너 (client 잎사귀) */}
      <CourseNoticeBanner notices={notices} />

      {/* 히어로 */}
      <div className="w-full" style={{ backgroundColor: '#2F5DAA' }}>
        <div className="w-full max-w-[1440px] mx-auto px-8 py-20">
          <h1 className="text-white font-semibold text-5xl leading-[60px] tracking-wide mb-6">
            2027 수능
            <br />1등급을 향한 여정
          </h1>
          <p className="text-white/95 text-lg leading-relaxed max-w-2xl">
            최고의 강사진과 체계적인 커리큘럼으로 목표 달성을 이루세요. 학습
            타이머로 공부 습관을 만들어보세요.
          </p>
        </div>
      </div>

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
        <CourseList courses={courses} status={status} />
      </div>
    </div>
  );
}
