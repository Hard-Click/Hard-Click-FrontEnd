export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import CourseCreateForm from '@/features/instructor/components/CourseCreateForm';
import { getCourseDetailServer } from '@/features/courses/server';
import { SUBJECTS } from '@/features/courses/subjects';
import type { CurriculumSection, CurriculumLesson } from '@/features/courses/types';
import { mockAdminInstructorOptions } from '@/mocks/admin.mock';

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function AdminCourseEditPage({ params }: Props) {
  const { courseId } = await params;
  if (isNaN(Number(courseId))) notFound();
  const course = await getCourseDetailServer(Number(courseId));

  if (!course) {
    notFound();
  }

  // 과목명(라벨) → subjectId 변환 (폼은 subjectId를 받음)
  const subjectId =
    SUBJECTS.find((s) => s.name === course.subjectName)?.subjectId ?? 0;

  return (
    <CourseCreateForm
      mode="edit"
      instructorOptions={mockAdminInstructorOptions}
      redirectPath="/admin/courses/manage"
      initialData={{
        courseId: course.courseId,
        title: course.title,
        subjectId,
        instructor: course.instructorName,
        description: course.description ?? '',
        priceType: course.isFree ? 'FREE' : 'PAID',
        price: String(course.price),
        thumbnailUrl: course.thumbnailUrl,
        learningGoals: course.learningGoals,
        targetAudience: course.targetAudience,
        techTags: course.techTags,
        level: course.level,
        // 수정 저장 시 기존 커리큘럼이 빈 배열로 덮이지 않도록 매핑 (CodeRabbit #775)
        curriculum: (course.curriculum ?? []).map(
          (section: CurriculumSection) => ({
            id: String(section.sectionId),
            title: section.title,
            lectures: (section.lessons ?? []).map((lesson: CurriculumLesson) => ({
              id: String(lesson.lessonId),
              fileName: lesson.title,
              duration: lesson.duration,
            })),
          }),
        ),
      }}
    />
  );
}
