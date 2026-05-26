'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import CourseCreateForm from '@/features/instructor/components/CourseCreateForm';

export default function EditCoursePage() {
  const params = useParams();

  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem('myCourses') || '[]');

    const foundCourse = savedCourses.find(
      (item: any) => item.id === Number(params.courseid)
    );

    setCourse(foundCourse);
  }, [params.courseid]);

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
        price: course.price === '무료' ? '' : course.price.replace('원', ''),
        thumbnailUrl: course.thumbnailUrl,
        thumbnailName: course.thumbnailName,
        curriculum: course.curriculum,
      }}
    />
  );
}
