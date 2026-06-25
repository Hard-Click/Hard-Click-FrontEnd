import CourseList from '@/features/courses/components/CourseList';
import CourseNoticeBanner from '@/features/courses/components/CourseNoticeBanner';
import InstructorCourseListControls from '@/features/instructor/components/InstructorCourseListControls';
import { getCoursesServer, getSubjectsServer } from '@/features/courses/server';
import { getInstructorCoursesServer } from '@/features/instructor/server';
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

  const [subjects, notices, catalog] = await Promise.all([
    getSubjectsServer(),
    getPinnedNoticesServer(),
    getCoursesServer({ sort: 'latest' }),
  ]);
  // 강사 필터 옵션 = 실제 카탈로그(라이브)의 강사 이름 — 카드에 뜨는 이름과 일치시킴.
  // (기존 getInstructors()는 mock 강사명이라 라이브 카드 이름과 불일치 → 강사 필터가 0건이었음)
  // ⚡최적화 대상: 필터 없을 땐 catalog를 courses로 재사용 가능(현재는 명확성 위해 별도 fetch).
  const instructors = Array.from(
    new Set(catalog.map((c) => c.instructorName).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, 'ko'));

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
    // 삭제된(DELETED) 강의는 '내 강의'에서 숨김 (BE가 강사 목록에 삭제 강의도 포함해 내려줌)
    mapped = mapped.filter((c) => c.status !== 'DELETED');
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
      <CourseNoticeBanner notices={notices} href="/instructor/notices/global" />

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
