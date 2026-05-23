import type { CourseListItem } from '../types';
import CourseCard from './CourseCard';

type ListStatus = 'loading' | 'error' | 'empty' | 'no-results' | 'idle';

interface Props {
  courses: CourseListItem[];
  status: ListStatus;
}

const STATUS_MESSAGE: Record<Exclude<ListStatus, 'idle' | 'loading'>, string> = {
  error: '강의 정보를 불러오지 못했습니다.',
  empty: '등록된 강의가 없습니다.',
  'no-results': '검색 결과가 없습니다.',
};

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: '284/192' }} />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center py-16 gap-4">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="5" y="5" width="54" height="54" rx="27" stroke="#E2E8F0" strokeWidth="5.33" />
        <path d="M25 20v24l18-12L25 20z" stroke="#E2E8F0" strokeWidth="5.33" strokeLinejoin="round" />
      </svg>
      <p className="text-[#1F2937] font-bold text-2xl">{message}</p>
      <p className="text-[#4B5563] text-base">강의 정보를 다시 확인해주세요</p>
    </div>
  );
}

export default function CourseList({ courses, status }: Props) {
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (status !== 'idle') {
    return <EmptyState message={STATUS_MESSAGE[status as keyof typeof STATUS_MESSAGE]} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-6">
      {courses.map(course => (
        <CourseCard key={course.courseId} course={course} />
      ))}
    </div>
  );
}
