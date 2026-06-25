import {
  getRankingBoardServer,
  getMyRankingServer,
} from '@/features/rankings/server';
import { getCurrentUser } from '@/features/auth/session';
import RankingClient from '@/features/rankings/components/RankingClient';
import type { RankingPeriod } from '@/features/rankings/types';

const VALID_PERIODS: RankingPeriod[] = ['daily', 'weekly', 'monthly'];

/**
 * 랭킹 페이지 (Server Component) — `/rankings?period=daily|weekly|monthly`.
 * 보드(탭별 순위)·내 랭킹을 서버에서 조회 → 상호작용(지표 탭)은 RankingClient(client 섬).
 * 기간 선택은 URL 구동(서버 재조회). 본인 행 강조 위해 내 memberId를 보드 매퍼에 전달.
 */
export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period: RankingPeriod = VALID_PERIODS.includes(
    periodParam as RankingPeriod,
  )
    ? (periodParam as RankingPeriod)
    : 'monthly';

  const user = await getCurrentUser();
  const myMemberId = user?.memberId ?? -1;

  const [board, myRanking] = await Promise.all([
    getRankingBoardServer(period, myMemberId),
    getMyRankingServer(),
  ]);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">랭킹</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          열공한 수험생들을 확인해보세요!
        </p>
      </div>

      <RankingClient board={board} myRanking={myRanking} period={period} />
    </div>
  );
}
