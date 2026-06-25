'use client';

import { useState } from 'react';
import RankingPeriodTabs from './RankingPeriodTabs';
import RankingTabs from './RankingTabs';
import MyRankingSummaryCard from './MyRankingSummaryCard';
import RankingPodium from './RankingPodium';
import RankingTable from './RankingTable';
import type {
  RankingBoard,
  RankingTabType,
  RankingPeriod,
  MyRankingSummary,
} from '../types';

/**
 * 랭킹 상호작용 섬(client) — 지표 탭 전환만 client, 데이터는 server에서 props로 받음.
 * 기간(period)은 URL 구동이라 RankingPeriodTabs가 URL을 바꾸면 서버가 재조회한다.
 * 활성 탭에 맞춰 내 순위(포커스) + 포디움(top3) + 리스트(4위~)를 렌더.
 */
export default function RankingClient({
  board,
  myRanking,
  period,
}: {
  board: RankingBoard;
  myRanking: MyRankingSummary;
  period: RankingPeriod;
}) {
  const [activeTab, setActiveTab] = useState<RankingTabType>('studyTime');
  const users = board[activeTab];
  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <>
      {/* 기간 선택 (일간/주간/월간 — URL 구동) */}
      <div className="mb-4">
        <RankingPeriodTabs period={period} />
      </div>

      {/* 지표 탭 */}
      <RankingTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 내 순위 (포커스) */}
      <div className="mt-4">
        <MyRankingSummaryCard metric={activeTab} myRanking={myRanking} />
      </div>

      {/* 포디움 */}
      <div className="mt-6">
        <RankingPodium top3={top3} />
      </div>

      {/* 4위~10위 리스트 */}
      <div className="mt-4">
        <RankingTable users={rest} />
      </div>
    </>
  );
}
