import type { RankingUser } from '../types';

interface RankingRowProps {
  user: RankingUser;
}

export default function RankingRow({ user }: RankingRowProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border px-5 py-3 shadow-sm ${
        user.isMe
          ? 'border-[#2F5DAA] bg-[#EFF6FF] ring-1 ring-[#2F5DAA]'
          : 'border-[#E2E8F0] bg-white'
      }`}
    >
      {/* 순위 */}
      <span className="w-6 text-center text-sm font-bold text-[#64748B]">{user.rank}</span>

      {/* 아바타 */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#2F5DAA]">
        {user.name.charAt(0)}
      </div>

      {/* 이름 + 서브타이틀 */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#1E293B]">{user.name}</p>
        {user.subtitle && (
          <p className="text-xs text-[#94A3B8]">{user.subtitle}</p>
        )}
      </div>

      {/* 값 */}
      <span className="text-sm font-bold text-[#2F5DAA]">{user.value}</span>
    </div>
  );
}
