import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getQuizzesServer,
  getTakenWeeksByCourseServer,
} from '@/features/quizzes/server';
import QuizListContent from '@/features/quizzes/components/QuizListContent';
import { mockAdminCourseManage } from '@/mocks/admin.mock';
import QuizCreateButton from '@/features/quizzes/components/QuizCreateButton';

export default async function AdminCourseQuizzesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: courseIdStr } = await params;
  const courseId = Number(courseIdStr);
  if (Number.isNaN(courseId)) notFound();

  const [quizzes, takenWeeksByCourse] = await Promise.all([
    getQuizzesServer(courseId),
    getTakenWeeksByCourseServer(),
  ]);

  const courseName =
    mockAdminCourseManage.find((c) => c.id === courseId)?.title ?? '강의';
  const quizFormCourses = mockAdminCourseManage.map((c) => ({
    courseId: c.id,
    title: c.title,
    instructor: c.instructor,
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
              강의별 퀴즈를 등록하고 관리하세요.
            </p>
          </div>
        </div>

        <QuizCreateButton
          courses={quizFormCourses}
          takenWeeksByCourse={takenWeeksByCourse}
          presetCourseId={courseId}
        />
      </header>

      {/* 목록으로 돌아가기 → 강의 목록 */}
      <Link
        href="/admin/quizzes"
        className="mt-6 inline-flex items-center gap-1.5 text-base font-semibold text-[#4B5563] transition hover:text-[#1F2937]"
      >
        <Image src="/icons/arrowLeftIcon.svg" alt="" width={20} height={20} />
        목록으로 돌아가기
      </Link>

      <QuizListContent
        quizzes={quizzes}
        courseId={courseId}
        courseName={courseName}
        courses={quizFormCourses}
        takenWeeksByCourse={takenWeeksByCourse}
        basePath="/admin/quizzes"
        withInstructorSelect
      />
    </div>
  );
}
