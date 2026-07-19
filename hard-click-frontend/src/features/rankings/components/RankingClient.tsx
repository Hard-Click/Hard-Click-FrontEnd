'use client';

import { useState } from 'react';
import RankingTabs from './RankingTabs';
import MyRankingSummaryCard from './MyRankingSummaryCard';
import RankingPodium from './RankingPodium';
import RankingTable from './RankingTable';
import type { RankingBoard, RankingTabType, MyRankingSummary } from '../types';

/**
 * 랭킹 상호작용 섬(client) — 지표 탭 전환만 client, 데이터는 server에서 props로 받음.
 * 기간(period)은 URL 구동(헤더의 RankingPeriodTabs) → 바뀌면 서버가 재조회해 board·myRanking 갱신.
 * 활성 탭에 맞춰 내 순위(포커스) + 포디움(top3) + 리스트(포디움 있으면 4위~, 3명 미만이면 전원 1위~)를 렌더.
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
  // 3명 미만이면 시상대(RankingPodium)가 안 뜨므로(top3.length<3 → null) 전원을 리스트에 표시한다.
  //   안 그러면 rest=slice(3)이 1~3위를 버려 보드가 통째로 빈다(전체 1~2명일 때 랭킹이 안 뜨던 버그).
  //   user.rank는 데이터 필드라 리스트에 넘겨도 순위 번호(1위~)가 정확히 표시됨.
  const hasPodium = users.length >= 3;
  const top3 = users.slice(0, 3);
  const rest = hasPodium ? users.slice(3) : users;

  return (
    <>
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

      {/* 리스트 — 포디움 있으면 4위~, 3명 미만이면 전원(1위~) */}
      <div className="mt-4">
        <RankingTable users={rest} />
      </div>
    </>
  );
}
