export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import CourseCreateForm from '@/features/instructor/components/CourseCreateForm';
import { getCourseDetailServer } from '@/features/courses/server';
import { SUBJECTS } from '@/features/courses/subjects';
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
      }}
    />
  );
}
