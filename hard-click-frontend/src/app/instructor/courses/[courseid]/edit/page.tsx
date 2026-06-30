'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import CourseCreateForm from '@/features/instructor/components/CourseCreateForm';
import { getCourseDetail } from '@/features/courses/services';
import { SUBJECTS } from '@/features/courses/subjects';
import type { CurriculumSection, CurriculumLesson } from '@/features/courses/types';

export default function EditCoursePage() {
  const params = useParams();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const courseId = Number(params.courseid);
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    getCourseDetail(courseId)
      .then((data) => {
        if (data) {
          const matched = SUBJECTS.find((s) => s.value === data.subjectName);
          setCourse({
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
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [params.courseid]);

  if (isLoading) {
    return <div>강의 정보를 불러오는 중...</div>;
  }

  if (!course) {
    return <div>강의를 찾을 수 없습니다.</div>;
  }

  return (
    <CourseCreateForm
      mode="edit"
      initialData={{
        courseId: course.courseId,
        title: course.title,
        description: course.description,
        subjectId: course.subjectId,
        priceType: course.priceType,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
        thumbnailName: course.thumbnailName,
        learningGoals: course.learningGoals,
        targetAudience: course.targetAudience,
        techTags: course.techTags,
        level: course.level,
        curriculum: course.curriculum,
      }}
    />
  );
}
