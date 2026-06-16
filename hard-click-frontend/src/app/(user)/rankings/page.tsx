import {
  getRankingBoardServer,
  getMyRankingServer,
} from '@/features/rankings/server';
import RankingClient from '@/features/rankings/components/RankingClient';

/**
 * 랭킹 페이지 (Server Component) — `/rankings`.
 * 보드(탭별 순위)·내 랭킹을 서버에서 조회 → 상호작용(탭 전환)은 RankingClient(client 섬).
 */
export default async function RankingPage() {
  const [board, myRanking] = await Promise.all([
    getRankingBoardServer(),
    getMyRankingServer(),
  ]);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">랭킹</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          이번 달 열공한 수험생들을 확인해보세요!
        </p>
      </div>

      <RankingClient board={board} myRanking={myRanking} />
    </div>
  );
}
