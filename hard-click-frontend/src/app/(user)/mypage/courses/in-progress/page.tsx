'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyCourses } from '@/features/users/services';
import type { MyCourse } from '@/features/users/types';

/** ISO 날짜 → YYYY.MM.DD */
function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function InProgressCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<MyCourse[]>([]);

  useEffect(() => {
    getMyCourses('recent').then((res) => {
      if (res.success) setCourses(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="w-full">
        <div className="max-w-[1280px] mx-auto px-8 pt-9 pb-32">
          {/* 페이지 히어로 */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로가기"
              className="w-6 h-6 flex items-center justify-center text-[#4B5563] hover:text-[#1F2937]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2F5DAA] rounded-[20px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/bookIcon.svg"
                    width={28}
                    height={28}
                    alt=""
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <h1 className="text-[30px] font-bold leading-9 text-[#1F2937] tracking-[0.4px]">
                  수강 중인 강의
                </h1>
              </div>
              <p className="text-base text-[#4B5563]">진행 중인 강의와 학습 현황을 확인해보세요.</p>
            </div>
          </div>

          {/* 강의 카드 컨테이너 */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] p-[33px] flex flex-col gap-5">
            {courses.length === 0 ? (
              <EmptyState />
            ) : (
              courses.map((course) => (
                <article
                  key={course.courseId}
                  className="border border-[#E2E8F0] rounded-[20px] p-5 flex gap-5 items-center"
                >
                  {/* 썸네일 박스 */}
                  <div className="w-40 h-[140px] bg-[#F8FAFC] rounded-2xl flex items-center justify-center flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/courseThumbnailIcon.svg" width={48} height={48} alt="" />
                  </div>

                  {/* 우측 컨텐츠 */}
                  <div className="flex-1 flex flex-col gap-[15px]">
                    <div>
                      <h3 className="text-lg font-semibold leading-7 text-[#1F2937]">
                        {course.courseTitle}
                      </h3>
                      <p className="text-sm text-[#4B5563] mt-0.5">{course.instructorName}</p>
                    </div>

                    {/* 진도바 */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#4B5563]">진도율</span>
                        <span className="text-base font-bold text-[#2F5DAA]">
                          {Math.round(course.progressRate)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2F5DAA] rounded-full"
                          style={{ width: `${course.progressRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#4B5563]">
                        최근 학습: {formatDisplayDate(course.lastStudiedAt)}
                      </span>
                      <Link
                        href={`/learning/videos/${course.courseId}`}
                        className="w-[95px] h-10 bg-[#2F5DAA] rounded-[10px] flex items-center justify-center text-white text-base font-semibold hover:bg-[#1D3E75] transition-colors"
                      >
                        이어보기
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
      <p className="text-xl font-bold text-[#1F2937]">수강 중인 강의가 없습니다.</p>
      <p className="text-sm text-[#4B5563]">새로운 강의를 둘러보고 학습을 시작해보세요.</p>
    </div>
  );
}
