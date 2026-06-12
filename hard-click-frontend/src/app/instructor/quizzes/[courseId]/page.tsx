import Link from 'next/link';
import Image from 'next/image';
import { getQuizzesServer } from '@/features/quizzes/server';
import { getInstructorCoursesServer } from '@/features/instructor/server';
import QuizListContent from '@/features/quizzes/components/QuizListContent';
import QuizCreateButton from '@/features/quizzes/components/QuizCreateButton';

/**
 * 강사 퀴즈 관리 — 강의별 퀴즈 목록 (Server Component).
 * Screen 1 강의 목록의 [조회] → 여기. 데이터는 서버에서 조회해 client(QuizListContent)에 props로 전달.
 */
export default async function CourseQuizzesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: courseIdStr } = await params;
  const courseId = Number(courseIdStr);

  const [quizzes, coursesRes] = await Promise.all([
    getQuizzesServer(courseId),
    getInstructorCoursesServer(),
  ]);

  // 강의명은 하드코딩 X — 선택한 강의의 실제 제목
  const courseName =
    coursesRes.content.find((c) => c.courseId === courseId)?.title ?? '강의';

  // 클라이언트(모달 셀렉트)엔 필요한 필드만 — 서버 DTO 누수 방지 + RSC payload 축소
  const quizFormCourses = coursesRes.content.map((c) => ({
    courseId: c.courseId,
    title: c.title,
  }));

  return (
    <div className="mx-auto max-w-[1253px] px-8 py-8">
      {/* 헤더 */}
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
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
            <h1 className="text-3xl font-bold tracking-[0.4px] text-[#1F2937]">
              퀴즈 관리
            </h1>
            <p className="mt-1 text-base text-[#4B5563]">
              본인 강의의 퀴즈를 등록하고 관리하세요.
            </p>
          </div>
        </div>

        <QuizCreateButton courses={quizFormCourses} />
      </header>

      {/* 이전으로 돌아가기 → 강의 목록(Screen 1) */}
      <Link
        href="/instructor/quizzes"
        className="mt-6 inline-flex items-center gap-1.5 text-base font-semibold text-[#4B5563] transition hover:text-[#1F2937]"
      >
        <Image src="/icons/arrowLeftIcon.svg" alt="" width={20} height={20} />{' '}
        이전으로 돌아가기
      </Link>

      <QuizListContent
        quizzes={quizzes}
        courseId={courseId}
        courseName={courseName}
        courses={quizFormCourses}
      />
    </div>
  );
}
