interface CourseIntroSectionProps {
  learningGoals: string[];
  targetAudience: string[];
  techTags: string[];
  totalDuration: string;
  level: string;
  /** 사이드네비 앵커 오프셋 — 학생 'scroll-mt-20' / 강사 'scroll-mt-6' */
  scrollMtClassName?: string;
}

/**
 * 강의 상세 "강의소개" 섹션 — 학생·강사 페이지 공용 (순수 표시).
 * 학습목표·추천대상·과목(techTags)·예상 학습 시간·난이도.
 * (제공자료는 BE 미제공이라 표시하지 않음 — 학생 페이지 기준으로 통일)
 */
export default function CourseIntroSection({
  learningGoals,
  targetAudience,
  techTags,
  totalDuration,
  level,
  scrollMtClassName = 'scroll-mt-20',
}: CourseIntroSectionProps) {
  return (
    <section id="intro" className={scrollMtClassName}>
      <div
        className="bg-white border border-[#D5D8DD]"
        style={{ padding: '33px 33px 1px' }}
      >
        <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">강의소개</h2>

        <div className="flex flex-col gap-8 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/targetIcon.svg" width={20} height={20} alt="" />
              <h3 className="text-lg font-semibold text-[#1A1F2E]">학습목표</h3>
            </div>
            <ul className="flex flex-col gap-[10px]">
              {learningGoals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/checkDarkIcon.svg"
                    width={20}
                    height={20}
                    alt=""
                    className="flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm leading-[23px] text-[#1A1F2E]">
                    {goal}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/studentsBlueIcon.svg"
                width={20}
                height={20}
                alt=""
              />
              <h3 className="text-lg font-semibold text-[#1A1F2E]">추천대상</h3>
            </div>
            <ul className="flex flex-col gap-[10px]">
              {targetAudience.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-sm leading-[20px] text-[#2F5DAA] select-none">
                    •
                  </span>
                  <span className="text-sm leading-[23px] text-[#1A1F2E]">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/bookIcon.svg" width={20} height={20} alt="" />
              <h3 className="text-lg font-semibold text-[#1A1F2E]">과목</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {techTags.map((tag, i) => (
                <span
                  key={i}
                  className="h-9 px-4 flex items-center bg-[rgba(47,93,170,0.1)] rounded-2xl text-sm font-medium text-[#2F5DAA]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-6">
            {[
              {
                icon: '/icons/clockBlueIcon.svg',
                label: '예상 학습 시간',
                value: totalDuration,
              },
              {
                icon: '/icons/trendUpBlueIcon.svg',
                label: '난이도',
                value: level,
              },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stat.icon}
                  width={20}
                  height={20}
                  alt=""
                  className="flex-shrink-0 mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <span
                    className="text-xs text-[#1A1F2E]"
                    style={{ lineHeight: '16px' }}
                  >
                    {stat.label}
                  </span>
                  <span
                    className="text-base font-semibold text-[#1A1F2E]"
                    style={{ lineHeight: '24px', letterSpacing: '-0.3125px' }}
                  >
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
