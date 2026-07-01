import { notFound } from 'next/navigation';

import CourseCreateForm from '@/features/instructor/components/CourseCreateForm';
import { getCourseDetailServer } from '@/features/courses/server';
import { SUBJECTS } from '@/features/courses/subjects';
import type { CurriculumSection, CurriculumLesson } from '@/features/courses/types';

interface EditCoursePageProps {
  params: Promise<{ courseid: string }>;
}

// Server Component: 강의 상세를 서버에서 조회해 폼(client)에 props로 전달 (useEffect 페칭 X)
export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseid } = await params;
  const courseId = Number(courseid);

  const data = await getCourseDetailServer(courseId);
  if (!data) {
    notFound();
  }

  const matched = SUBJECTS.find((s) => s.name === data.subjectName);

  return (
    <CourseCreateForm
      mode="edit"
      initialData={{
        courseId,
        title: data.title,
        description: data.description ?? '',
        subjectId: matched?.subjectId ?? 0,
        priceType: data.isFree ? 'FREE' : 'PAID',
        price: data.isFree ? '' : String(data.price),
        thumbnailUrl: data.thumbnailUrl,
        thumbnailName: '',
        learningGoals: data.learningGoals ?? [],
        targetAudience: data.targetAudience ?? [],
        techTags: data.techTags ?? [],
        level: data.level ?? '',
        curriculum: (data.curriculum ?? []).map((section: CurriculumSection) => ({
          id: String(section.sectionId),
          title: section.title,
          lectures: (section.lessons ?? []).map((lesson: CurriculumLesson) => ({
            id: String(lesson.lessonId),
            fileName: lesson.title,
            duration: lesson.duration,
          })),
        })),
      }}
    />
  );
}
