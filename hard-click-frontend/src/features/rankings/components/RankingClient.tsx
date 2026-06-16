'use client';

import { useState } from 'react';
import RankingTabs from './RankingTabs';
import MyRankingSummaryCard from './MyRankingSummaryCard';
import RankingPodium from './RankingPodium';
import RankingTable from './RankingTable';
import type { RankingBoard, RankingTabType, MyRankingSummary } from '../types';

/**
 * 랭킹 상호작용 섬(client) — 탭 전환만 client, 데이터는 server에서 props로 받음.
 * 활성 탭에 맞춰 내 순위(포커스) + 포디움(top3) + 리스트(4위~)를 렌더.
 */
export default function RankingClient({
  board,
  myRanking,
}: {
  board: RankingBoard;
  myRanking: MyRankingSummary;
}) {
  const [activeTab, setActiveTab] = useState<RankingTabType>('studyTime');
  const users = board[activeTab];
  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <>
      {/* 탭 */}
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
