'use client';

export interface RankingUser {
  rank: number;
  name: string;
  subtitle: string;
  value: string;
}

interface RankingPodiumProps {
  top3: RankingUser[];
}

const MEDAL_COLORS: Record<number, { ring: string; badge: string; bg: string; text: string }> = {
  1: { ring: '#F59E0B', badge: '#F59E0B', bg: '#FEF9C3', text: '#78350F' },
  2: { ring: '#94A3B8', badge: '#94A3B8', bg: '#F1F5F9', text: '#475569' },
  3: { ring: '#D97706', badge: '#D97706', bg: '#FEF3C7', text: '#92400E' },
};

const PODIUM_ORDER = [1, 0, 2]; // 화면 순서: 2위, 1위, 3위

function PodiumCard({ user, isFirst }: { user: RankingUser; isFirst: boolean }) {
  const colors = MEDAL_COLORS[user.rank];

  return (
    <div className={`flex flex-col items-center ${isFirst ? 'mb-0' : 'mt-6'}`}>
      {/* 메달 + 아바타 */}
      <div className="relative">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
          style={{
            backgroundColor: colors.bg,
            border: `3px solid ${colors.ring}`,
            color: colors.text,
          }}
        >
          {user.name.charAt(0)}
        </div>
        {/* 순위 뱃지 */}
        <div
          className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: colors.badge }}
        >
          {user.rank}
        </div>
      </div>

      {/* 이름 */}
      <p className="mt-4 text-sm font-bold text-[#1E293B]">{user.name}</p>
      <p className="mt-0.5 text-xs text-[#94A3B8]">{user.subtitle}</p>

      {/* 점수 */}
      <div
        className="mt-2 rounded-xl px-3 py-1 text-sm font-semibold"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {user.value}
      </div>

      {/* 포디움 받침대 */}
      <div
        className={`mt-3 w-24 rounded-t-xl ${isFirst ? 'h-16' : 'h-10'}`}
        style={{ backgroundColor: colors.ring, opacity: 0.3 }}
      />
    </div>
  );
}

export default function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null;

  return (
    <div className="flex items-end justify-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-6 py-8 shadow-sm">
      {PODIUM_ORDER.map((idx) => (
        <PodiumCard
          key={top3[idx].rank}
          user={top3[idx]}
          isFirst={top3[idx].rank === 1}
        />
      ))}
    </div>
  );
}
