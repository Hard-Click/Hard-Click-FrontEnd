import type { InstructorProfile } from '@/features/courses/types';

interface CourseInstructorSectionProps {
  instructor: InstructorProfile;
  /** 사이드네비 앵커 오프셋 — 학생 'scroll-mt-20' / 강사 'scroll-mt-6' (hero 높이 차이) */
  scrollMtClassName?: string;
}

/**
 * 강의 상세 "강사소개" 섹션 — 학생·강사 페이지 공용 (순수 표시).
 * subtitle←instructorOneLineIntro, bio←instructorIntroduction, career←instructorCareer(줄바꿈 분리).
 * ⚡ 아바타는 BE에 강사 사진 필드가 없어 placeholder 고정 — 필드 생기면 instructor.avatarUrl prop화.
 */
export default function CourseInstructorSection({
  instructor,
  scrollMtClassName = 'scroll-mt-20',
}: CourseInstructorSectionProps) {
  return (
    <section id="instructor" className={scrollMtClassName}>
      <div
        className="bg-white border border-[#D5D8DD]"
        style={{ padding: '33px 33px 1px' }}
      >
        <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">강사소개</h2>

        <div className="flex items-start gap-6 pb-8">
          <div className="flex-shrink-0 w-28 h-28 rounded-full border-2 border-[#D5D8DD] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/image/Image (박지훈).svg"
              width={112}
              height={112}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xl font-semibold text-[#1A1F2E] mb-0.5">
              {instructor.name}
            </p>
            <p className="text-base text-[#1A1F2E] mb-3">{instructor.subtitle}</p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/studentsBlueIcon.svg"
                  width={16}
                  height={16}
                  alt=""
                />
                <span className="text-sm text-[#1A1F2E]">
                  수강생 {instructor.instructorStudentCount.toLocaleString()}명
                </span>
              </div>
              <div className="flex-1 flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/bookIcon.svg" width={16} height={16} alt="" />
                <span className="text-sm text-[#1A1F2E]">
                  강의 {instructor.instructorCourseCount}개
                </span>
              </div>
              <div className="flex-1 flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/starFilledIcon.svg"
                  width={16}
                  height={16}
                  alt=""
                />
                <span className="text-sm text-[#1A1F2E]">
                  평점 {instructor.instructorRating}
                </span>
              </div>
            </div>

            <p className="text-sm leading-[23px] text-[#1A1F2E] mb-4">
              {instructor.bio}
            </p>

            {/* 경력 */}
            <p className="text-sm font-semibold text-[#1A1F2E] mb-2">경력</p>
            <div className="flex flex-col gap-1 mb-4">
              {instructor.career.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-sm leading-[20px] text-[#2F5DAA] select-none">
                    •
                  </span>
                  <span className="text-sm leading-[20px] text-[#1A1F2E]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* 태그 — Figma: 하단 배치 */}
            <div className="flex flex-wrap gap-2">
              {instructor.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[rgba(47,93,170,0.1)] rounded-full text-xs font-medium text-[#2F5DAA]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
