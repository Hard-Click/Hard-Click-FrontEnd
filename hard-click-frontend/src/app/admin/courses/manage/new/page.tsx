import CourseCreateForm from '@/features/instructor/components/CourseCreateForm';
import { mockAdminInstructorOptions } from '@/mocks/admin.mock';

export default function AdminCourseCreatePage() {
  // 관리자 등록: 강사 폼 재사용 + 강사 선택 노출, 성공/취소 시 관리자 강의 목록으로
  return (
    <CourseCreateForm
      instructorOptions={mockAdminInstructorOptions}
      redirectPath="/admin/courses/manage"
    />
  );
}
