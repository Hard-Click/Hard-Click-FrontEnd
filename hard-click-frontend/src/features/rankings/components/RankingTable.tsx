'use client';

import RankingRow from './RankingRow';
import type { RankingUser } from './RankingPodium';

interface RankingTableProps {
  users: RankingUser[]; // 4위~10위
}

export default function RankingTable({ users }: RankingTableProps) {
  return (
    <div className="flex flex-col gap-2">
      {users.map((user) => (
        <RankingRow key={user.rank} user={user} />
      ))}
    </div>
  );
}
