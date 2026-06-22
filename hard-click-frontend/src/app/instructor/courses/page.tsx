import CourseList from '@/features/courses/components/CourseList';
import CourseNoticeBanner from '@/features/courses/components/CourseNoticeBanner';
import InstructorCourseListControls from '@/features/instructor/components/InstructorCourseListControls';
import { getCoursesServer, getSubjectsServer } from '@/features/courses/server';
import { getInstructorCoursesServer } from '@/features/instructor/server';
import { getInstructors } from '@/features/courses/services';
import { getPinnedNoticesServer } from '@/features/notices/server';
import type { CourseSortType, CourseListItem } from '@/features/courses/types';

interface PageProps {
  searchParams: Promise<{
    keyword?: string;
    subjectId?: string;
    instructor?: string;
    sort?: string;
    mine?: string;
  }>;
}

// Server Component: 필터는 URL searchParams, 데이터는 서버에서 확보 (useEffect 없음)
export default async function InstructorCoursesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const keyword = sp.keyword ?? '';
  const subjectId = sp.subjectId ? Number(sp.subjectId) : undefined;
  const instructor = sp.instructor ?? '';
  const sort = (sp.sort as CourseSortType) ?? 'latest';
  const mine = sp.mine === 'true';

  const [subjects, notices] = await Promise.all([
    getSubjectsServer(),
    getPinnedNoticesServer(),
  ]);
  const instructors = getInstructors();

  let courses: CourseListItem[];
  if (mine) {
    // 내 강의만: 강사 강의 목록을 CourseListItem으로 변환 후 키워드/과목 필터
    const { content } = await getInstructorCoursesServer();
    let mapped: CourseListItem[] = content.map((c) => ({
      courseId: c.courseId,
      title: c.title,
      instructorName: '',
      subjectName: c.subjectName,
      price: c.price,
      thumbnailUrl: c.thumbnailUrl,
      averageRating: c.averageRating,
      reviewCount: c.reviewCount,
      studentCount: c.enrollmentCount,
      status: c.status,
      createdAt: c.createdAt,
      isFree: c.price === 0,
      isEnrolled: false,
      hasPreview: false,
    }));
    if (keyword) {
      const kw = keyword.toLowerCase();
      mapped = mapped.filter((c) => c.title.toLowerCase().includes(kw));
    }
    if (subjectId) {
      const subject = subjects.find((s) => s.subjectId === subjectId);
      if (subject) mapped = mapped.filter((c) => c.subjectName === subject.name);
    }
    courses = mapped;
  } else {
    courses = await getCoursesServer({
      keyword: keyword || undefined,
      subjectId,
      instructor: instructor || undefined,
      sort,
    });
  }

  const hasFilter = Boolean(keyword || subjectId || instructor || mine);
  const status: 'empty' | 'no-results' | 'idle' =
    courses.length === 0 ? (hasFilter ? 'no-results' : 'empty') : 'idle';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 공지 배너 (client 잎사귀) */}
      <CourseNoticeBanner notices={notices} href="/instructor/notices" />

      {/* 히어로 */}
      <div
        className="w-full"
        style={{ background: 'linear-gradient(90deg, #2F5DAA 0%, #4D6FBF 100%)' }}
      >
        <div className="w-full max-w-[1440px] mx-auto px-8 py-20">
          <h1 className="text-white font-semibold text-5xl leading-[60px] tracking-wide mb-6">
            2027 수능
            <br />
            1등급을 향한 여정
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

        {/* 검색 + 필터 (client 잎사귀, URL 구동) */}
        <InstructorCourseListControls
          subjects={subjects}
          instructors={instructors}
          keyword={keyword}
          selectedSubjectId={subjectId}
          selectedInstructor={instructor}
          sort={sort}
          myCoursesOnly={mine}
        />

        {/* 강의 목록 (server) */}
        <CourseList courses={courses} status={status} hrefPrefix="/instructor/courses" />
      </div>
    </div>
  );
}
