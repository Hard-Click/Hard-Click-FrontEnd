import { mockAdminCourseManage } from '@/mocks/admin.mock';
import AdminCourseCreateForm from '@/features/admin/components/AdminCourseCreateForm';

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function AdminCourseEditPage({ params }: Props) {
  const { courseId } = await params;
  const course = mockAdminCourseManage.find((c) => c.id === Number(courseId));

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#64748B]">
        강의를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <AdminCourseCreateForm
      mode="edit"
      initialData={{
        courseId: course.id,
        title: course.title,
        subject: course.subject,
        instructor: course.instructor,
        description: '',
        priceType: course.isFree ? 'FREE' : 'PAID',
        price: String(course.price),
      }}
    />
  );
}
