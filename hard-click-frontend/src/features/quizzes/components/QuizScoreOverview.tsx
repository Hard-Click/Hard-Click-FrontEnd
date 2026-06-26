import type { ScoreSummary } from '../scoreboard';

/** 통계 카드 아이콘 (lucide 스타일, 카드 색에 맞춤) */
const CARD_ICONS = {
  total: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  attended: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F5DAA" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  ),
  notAttended: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="22" y2="13" />
      <line x1="22" y1="8" x2="17" y2="13" />
    </svg>
  ),
  average: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
};

/**
 * 점수 현황 상단 — 통계 3카드(응시·미응시·평균) + 점수 분포 막대.
 * 순수 표시용(Server Component) — 집계값은 page에서 summarizeScores로 계산해 props로.
 */
export default function QuizScoreOverview({
  summary,
}: {
  summary: ScoreSummary;
}) {
  const cards = [
    { label: '전체 인원', value: `${summary.totalCount}명`, bgClass: 'bg-[#47556918]', icon: CARD_ICONS.total },
    { label: '응시 인원', value: `${summary.attendedCount}명`, bgClass: 'bg-[#2F5DAA18]', icon: CARD_ICONS.attended },
    { label: '미응시 인원', value: `${summary.notAttendedCount}명`, bgClass: 'bg-[#B91C1C18]', icon: CARD_ICONS.notAttended },
    { label: '평균 점수', value: `${summary.average}점`, bgClass: 'bg-[#16A34A18]', icon: CARD_ICONS.average },
  ];

  return (
    <>
      {/* 통계 3카드 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_5px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl ${c.bgClass}`}
              >
                {c.icon}
              </span>
              <span className="text-sm text-[#4B5563]">{c.label}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1F2937]">{c.value}</p>
          </div>
        ))}
      </div>

      {/* 점수 분포 */}
      <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_5px_rgba(0,0,0,0.06)]">
        <h2 className="text-base font-bold text-[#1F2937]">
          점수 분포{' '}
          <span className="text-sm font-normal text-[#9CA3AF]">(응시자 기준)</span>
        </h2>
        <div className="mt-5 space-y-3">
          {summary.distribution.map((d) => (
            <div key={d.label} className="flex items-center gap-4">
              <span className="w-14 shrink-0 text-right text-sm font-semibold text-[#4B5563]">
                {d.label}
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${d.percent}%`, background: d.color }}
                />
              </div>
              <span className="w-20 shrink-0 text-sm text-[#4B5563]">
                {d.count}명 ({d.percent}%)
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
