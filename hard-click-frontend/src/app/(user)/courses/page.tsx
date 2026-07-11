import CourseList from '@/features/courses/components/CourseList';
import CourseListControls from '@/features/courses/components/CourseListControls';
import CourseNoticeBanner from '@/features/courses/components/CourseNoticeBanner';
import CoursesHero from '@/features/courses/components/CoursesHero';
import { getCoursesServer, getSubjectsServer } from '@/features/courses/server';
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

  // ⚠️ 강사 필터는 빼고 조회한다(과목·검색·정렬만).
  // 강사 드롭다운 옵션을 이 결과에서 뽑으므로, 강사 선택에 따라 옵션이 줄어들지 않는다.
  const [baseCourses, subjects, notices] = await Promise.all([
    getCoursesServer({
      keyword: keyword || undefined,
      subjectId,
      sort,
    }),
    getSubjectsServer(),
    getPinnedNoticesServer(),
  ]);
  // 강사 드롭다운 옵션 = (현재 과목·검색에 해당하는) 전체 강사. 강사 선택과 무관하게 고정.
  // (BE에 강사 목록 API 없음 → 조회된 강의들의 강사명에서 파생)
  const instructors = Array.from(
    new Set(baseCourses.map((c) => c.instructorName).filter(Boolean)),
  ).sort();
  // 화면 표시용 강의 = 선택된 강사로 한 번 더 거른다 (BE에 강사 필터 없음 → 여기서)
  const courses = instructor
    ? baseCourses.filter((c) => c.instructorName === instructor)
    : baseCourses;

  const hasFilter = Boolean(keyword || subjectId || instructor);
  const status: 'empty' | 'no-results' | 'idle' =
    courses.length === 0 ? (hasFilter ? 'no-results' : 'empty') : 'idle';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 공지 배너 (client 잎사귀) */}
      <CourseNoticeBanner notices={notices} />

      {/* 히어로 (공용) */}
      <CoursesHero />

      {/* 메인 콘텐츠 */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-16">
        <div className="mb-6">
          <h2 className="text-[#1F2937] font-bold text-2xl md:text-3xl leading-9 mb-2">
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
