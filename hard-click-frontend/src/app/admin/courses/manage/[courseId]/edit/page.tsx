export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import AdminCourseCreateForm from '@/features/admin/components/AdminCourseCreateForm';
import { getCourseDetailServer } from '@/features/courses/server';

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

  return (
    <AdminCourseCreateForm
      mode="edit"
      initialData={{
        courseId: course.courseId,
        title: course.title,
        subject: course.subjectName,
        instructor: course.instructorName,
        description: course.description ?? '',
        priceType: course.isFree ? 'FREE' : 'PAID',
        price: String(course.price),
      }}
    />
  );
}
