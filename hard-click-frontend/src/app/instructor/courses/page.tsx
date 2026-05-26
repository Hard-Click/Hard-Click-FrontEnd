'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import InstructorHeader from '@/components/layout/headers/InstructorHeader';
import CourseSearchBar from '@/features/courses/components/CourseSearchBar';
import InstructorCourseFilterBar from '@/features/courses/components/InstructorCourseFilterBar';
import CourseList from '@/features/courses/components/CourseList';
import { getCourses, getSubjects, getInstructors } from '@/features/courses/services';
import { MOCK_CURRENT_INSTRUCTOR } from '@/features/instructor/services';
import { getPinnedNotices } from '@/features/notices/services';
import type { CourseListItem, Subject, CourseSortType } from '@/features/courses/types';
import type { Notice } from '@/features/notices/types';

type ListStatus = 'loading' | 'error' | 'empty' | 'no-results' | 'idle';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticeIndex, setNoticeIndex] = useState(0);

  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>();
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [sort, setSort] = useState<CourseSortType>('latest');
  const [myCoursesOnly, setMyCoursesOnly] = useState(false);

  const instructors = getInstructors();

  useEffect(() => {
    getSubjects().then(setSubjects);
    getPinnedNotices().then(setNotices);
  }, []);

  useEffect(() => {
    setStatus('loading');
    getCourses({
      keyword: submittedKeyword || undefined,
      subjectId: selectedSubjectId,
      instructor: myCoursesOnly ? MOCK_CURRENT_INSTRUCTOR : (selectedInstructor || undefined),
      sort,
    })
      .then(data => {
        setCourses(data);
        if (data.length === 0) {
          const hasFilter = submittedKeyword || selectedSubjectId || selectedInstructor || myCoursesOnly;
          setStatus(hasFilter ? 'no-results' : 'empty');
        } else {
          setStatus('idle');
        }
      })
      .catch(() => setStatus('error'));
  }, [submittedKeyword, selectedSubjectId, selectedInstructor, sort, myCoursesOnly]);

  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (trimmed && /^[^\w가-힣]+$/u.test(trimmed)) return;
    setSubmittedKeyword(trimmed);
  };

  const handleReset = () => {
    setKeyword('');
    setSubmittedKeyword('');
    setSelectedSubjectId(undefined);
    setSelectedInstructor('');
    setSort('latest');
    setMyCoursesOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <InstructorHeader />

      {/* 공지 배너 */}
      {notices.length > 0 && (
        <div className="w-full bg-[#FEF3E2] border-b border-[#F5D9A8]">
          <div className="w-full max-w-[1440px] mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/icons/notice.svg" alt="공지" width={20} height={20} className="flex-shrink-0" />
              <span className="text-[#1F2937] font-medium text-sm">{notices[noticeIndex].title}</span>
            </div>
            {notices.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNoticeIndex(i => (i - 1 + notices.length) % notices.length)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 4L6 8l4 4" stroke="#4B5563" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="flex items-center gap-1.5">
                  {notices.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setNoticeIndex(i)}
                      className="w-1.5 h-1.5 rounded-full transition-colors"
                      style={{ background: i === noticeIndex ? '#F97316' : 'rgba(75,85,99,0.3)' }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setNoticeIndex(i => (i + 1) % notices.length)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="#4B5563" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 히어로 */}
      <div
        className="w-full"
        style={{ background: 'linear-gradient(90deg, #2F5DAA 0%, #4D6FBF 100%)' }}
      >
        <div className="w-full max-w-[1440px] mx-auto px-8 py-20">
          <h1 className="text-white font-semibold text-5xl leading-[60px] tracking-wide mb-6">
            2027 수능<br />1등급을 향한 여정
          </h1>
          <p className="text-white/95 text-lg leading-relaxed max-w-2xl">
            최고의 강사진과 체계적인 커리큘럼으로 목표 달성을 이루세요. 학습 타이머로 공부 습관을 만들어보세요.
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="w-full max-w-[1440px] mx-auto px-8 pt-10 pb-16">
        {/* 섹션 헤더 */}
        <div className="mb-6">
          <h2 className="text-[#1F2937] font-bold text-3xl leading-9 mb-2">강의</h2>
          <p className="text-[#4B5563] text-base">원하는 강의를 찾아보세요.</p>
        </div>

        {/* 검색 + 필터 박스 */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] p-6 mb-8 flex flex-col gap-4">
          <CourseSearchBar
            value={keyword}
            onChange={setKeyword}
            onSearch={handleSearch}
          />
          <InstructorCourseFilterBar
            subjects={subjects}
            instructors={instructors}
            selectedSubjectId={selectedSubjectId}
            selectedInstructor={selectedInstructor}
            sort={sort}
            myCoursesOnly={myCoursesOnly}
            onSubjectChange={setSelectedSubjectId}
            onInstructorChange={setSelectedInstructor}
            onSortChange={setSort}
            onMyCoursesToggle={() => setMyCoursesOnly(v => !v)}
            onReset={handleReset}
          />
        </div>

        {/* 강의 목록 */}
        <CourseList courses={courses} status={status} />
      </div>
    </div>
  );
}
