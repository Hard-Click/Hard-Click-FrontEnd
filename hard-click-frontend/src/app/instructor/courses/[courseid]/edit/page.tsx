'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import CourseCreateForm from '@/features/instructor/components/CourseCreateForm';
import { getCourseDetail } from '@/features/courses/services';

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

    // API에서 강의 상세 조회 (실패 시 localStorage 폴백)
    getCourseDetail(courseId)
      .then((data) => {
        if (data) {
          setCourse({
            title: data.title,
            category: data.subjectName,
            description: data.description,
            priceType: data.isFree ? '무료' : '유료',
            price: data.isFree ? '' : String(data.price),
            thumbnailUrl: data.thumbnailUrl,
            thumbnailName: '',
            curriculum: data.curriculum,
          });
        } else {
          // 폴백: localStorage
          const savedCourses = JSON.parse(localStorage.getItem('myCourses') || '[]');
          const foundCourse = savedCourses.find(
            (item: any) => item.id === courseId,
          );
          setCourse(foundCourse);
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
        title: course.title,
        subject: course.category,
        description: course.description,
        priceType: course.priceType,
        price: course.price === '무료' ? '' : String(course.price).replace('원', ''),
        thumbnailUrl: course.thumbnailUrl,
        thumbnailName: course.thumbnailName,
        curriculum: course.curriculum,
      }}
    />
  );
}
