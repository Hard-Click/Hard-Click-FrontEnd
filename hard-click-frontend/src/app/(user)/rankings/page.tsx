import {
  getRankingBoardServer,
  getMyRankingServer,
} from '@/features/rankings/server';
import { getCurrentUser } from '@/features/auth/session';
import RankingClient from '@/features/rankings/components/RankingClient';
import RankingPeriodTabs from '@/features/rankings/components/RankingPeriodTabs';
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
  // 보드·내 랭킹 모두 인증이 필요한 엔드포인트(401)라, 비로그인이면 조회 자체가 실패해 throw된다.
  // layout은 client라 이 Server Component가 먼저 실행돼, 그대로 두면 의도한 401 안내 대신 에러 화면이 뜬다.
  // 여기서 일찍 반환하면 layout의 비로그인 분기(NotFoundView 401)가 정상적으로 보인다.
  if (!user) return null;
  // 로그인했는데 memberId가 없는 경우(-1)는 본인 행 강조만 안 될 뿐 조회는 정상.
  const myMemberId = user.memberId ?? -1;

  const [board, myRanking] = await Promise.all([
    getRankingBoardServer(period, myMemberId),
    getMyRankingServer(period),
  ]);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      {/* 헤더 — 제목(좌) + 기간 선택(우) */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">랭킹</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            열공한 수험생들을 확인해보세요!
          </p>
        </div>
        <RankingPeriodTabs period={period} />
      </div>

      <RankingClient board={board} myRanking={myRanking} />
    </div>
  );
}
