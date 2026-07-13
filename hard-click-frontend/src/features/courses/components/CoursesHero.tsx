import { daysUntilSuneung } from '@/mocks/subscriptions.mock';

/**
 * 강의 카탈로그 상단 히어로 — 학생·강사·관리자 courses 페이지 공용.
 *
 * 자기완결형(self-contained): 페이지 데이터를 props로 받지 않는다(정적 카피 + 수능 D-day만).
 * 각 courses 페이지의 조회·필터·목록 렌더와 완전히 독립 → 인라인 히어로를 이 컴포넌트로
 * 교체해도 페이지 로직에 회귀 위험이 없다.
 *
 * D-day: 구독 페이지가 쓰는 것과 동일한 daysUntilSuneung()(순수 날짜계산, 수능일 2026-11-19)를
 * 재사용한다 — 백엔드 추가요청 없음, 앱 전체 D-day 값 일관. courses 페이지는 searchParams를
 * 읽어 동적 렌더이므로 매 요청 최신값으로 계산된다. 수능 당일/이후엔 0으로 클램프되어 "D-DAY".
 */
export default function CoursesHero() {
  const dday = daysUntilSuneung();
  const ddayLabel = dday > 0 ? `D-${dday}` : 'D-DAY';

  return (
    <section className="relative w-full overflow-hidden bg-[#2F5DAA]">
      {/* 장식용 원형(aria-hidden) — 단색 배경의 밋밋함만 덜어낸다. 콘텐츠와 무관. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-28 -bottom-28 h-64 w-64 rounded-full bg-white/[0.06]"
      />

      <div className="relative w-full max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20">
        {/* 수능 D-day 배지 */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 mb-5 md:mb-6">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-white"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
          <span className="text-sm font-medium text-white">
            2027 수능까지 <span className="tabular-nums">{ddayLabel}</span>
          </span>
        </div>

        {/* 헤드라인 */}
        <h1 className="text-white font-semibold text-3xl md:text-5xl leading-tight md:leading-[60px] tracking-wide mb-4 md:mb-6">
          1등급을 향한 여정,
          <br />
          지금 시작하세요
        </h1>

        {/* 서브카피 */}
        <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-2xl">
          최고의 강사진과 체계적인 커리큘럼, 학습 타이머로 흔들림 없는 공부
          습관을 만들어요.
        </p>
      </div>
    </section>
  );
}
