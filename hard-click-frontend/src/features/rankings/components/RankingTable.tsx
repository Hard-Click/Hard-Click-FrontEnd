import RankingRow from './RankingRow';
import type { RankingUser } from '../types';

interface RankingTableProps {
  users: RankingUser[]; // 포디움 있으면 4위~, 3명 미만이면 전원(1위~) — 상한 없음
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
