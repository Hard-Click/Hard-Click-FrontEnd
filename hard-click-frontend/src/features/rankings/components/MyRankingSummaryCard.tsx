import type { RankingTabType, MyRankingSummary, RankItem } from '../types';

const METRIC_LABEL: Record<RankingTabType, string> = {
  studyTime: '순공 시간',
  lessonCount: '수강 횟수',
  acceptedCount: '채택 횟수',
};

const TrophyIcon = (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

/**
 * 내 랭킹 요약 카드 (포커스) — 활성 탭 기준 "전체 N명 중 R위 · 상위 P%".
 * 흰 리더보드 위에서 도드라지도록 브랜드 블루 강조 카드.
 */
export default function MyRankingSummaryCard({
  metric,
  myRanking,
}: {
  metric: RankingTabType;
  myRanking: MyRankingSummary;
}) {
  const rankByMetric: Record<RankingTabType, RankItem> = {
    studyTime: myRanking.studyTimeRank,
    lessonCount: myRanking.lessonRank,
    acceptedCount: myRanking.acceptedCommentRank,
  };
  const { rank, totalUsers, topPercent } = rankByMetric[metric];
  /* BE가 활동 시드 전/미랭크 유저에겐 rank=null을 주고 매퍼가 0으로 파생한다.
   * "0위·전체 0명·상위 0%" 위조 대신 '집계 전' 안내 (CLAUDE.md §0.1 규칙②, 마이페이지와 동일). */
  const isRanked = rank > 0 && totalUsers > 0;

  return (
    <section className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#2F5DAA] to-[#4071C0] px-6 py-5 text-white shadow-[0_8px_24px_-8px_rgba(47,93,170,0.5)]">
      {/* 아바타(트로피) */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
        {TrophyIcon}
      </div>

      {/* 라벨 */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white/70">내 랭킹</p>
        <p className="mt-0.5 text-sm font-semibold">{METRIC_LABEL[metric]}</p>
      </div>

      {/* 순위 */}
      <div className="flex flex-col items-end">
        {isRanked ? (
          <>
            <p className="leading-none">
              <span className="text-3xl font-extrabold">{rank}</span>
              <span className="ml-0.5 text-base font-bold">위</span>
            </p>
            <p className="mt-1 text-xs text-white/80">
              전체 {totalUsers.toLocaleString()}명 · 상위 {topPercent}%
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold leading-none">집계 전</p>
            <p className="mt-1 text-xs text-white/80">아직 순위가 없어요</p>
          </>
        )}
      </div>
    </section>
  );
}
