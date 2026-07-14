export const dynamic = 'force-dynamic';

import AdminQuizCourseManage from '@/features/admin/components/AdminQuizCourseManage';
import QuizCreateButton from '@/features/quizzes/components/QuizCreateButton';
import { getTakenWeeksByCourseServer, getAdminQuizCoursesServer } from '@/features/quizzes/server';
import { createAdminQuizAction, updateAdminQuizAction } from '@/features/quizzes/actions';
import { fetchAllAdminCourses } from '@/features/admin/server';

export default async function AdminQuizzesPage() {
  const [adminQuizCourses, fallbackCourses, takenWeeksByCourse] = await Promise.all([
    getAdminQuizCoursesServer(),
    fetchAllAdminCourses(),
    getTakenWeeksByCourseServer(),
  ]);

  // admin quiz courses API가 데이터를 반환하면 사용, 없으면 전체 강의 목록으로 폴백
  const base = adminQuizCourses.length > 0 ? adminQuizCourses : fallbackCourses;
  // ⚠️ 퀴즈 courses API(/api/admin/quizzes/courses)는 subjectName을 안 줘서 과목 필터가 '전체'만 뜬다
  //    (일반 강의목록 API엔 있음). 이미 함께 조회한 fallbackCourses(subject 보유)에서 courseId로 채운다.
  const subjectById = new Map(fallbackCourses.map((c) => [c.id, c.subject]));
  const courses = base.map((c) => ({
    ...c,
    subject: c.subject || subjectById.get(c.id) || '',
  }));

  const quizFormCourses = courses.map((c) => ({
    courseId: c.id,
    title: c.title,
    instructor: c.instructor,
  }));

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
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

          <QuizCreateButton
            courses={quizFormCourses}
            takenWeeksByCourse={takenWeeksByCourse}
            withInstructorSelect
            createAction={createAdminQuizAction}
            updateAction={updateAdminQuizAction}
          />
        </div>

        <AdminQuizCourseManage courses={courses} />
      </div>
    </div>
  );
}
