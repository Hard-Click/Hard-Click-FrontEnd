import type { ChurnReason } from '../types';

// 사유별 바 색상 (비중 높은 순 강조 → 빨강/주황/주황/회색)
const BAR_COLORS = ['#DC2626', '#F59E0B', '#F59E0B', '#94A3B8'];

/** 주요 이탈 사유 % 바 (Server Component — 정적 CSS 바, 라이브러리 불필요). */
export default function ChurnReasonBars({
  reasons,
}: {
  reasons: ChurnReason[];
}) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-[#1E293B]">주요 이탈 사유</h2>
      <ul className="space-y-4">
        {reasons.map((reason, idx) => (
          <li key={reason.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-[#475569]">{reason.label}</span>
              <span className="text-sm font-semibold text-[#1E293B]">
                {reason.percent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${reason.percent}%`,
                  backgroundColor: BAR_COLORS[idx] ?? '#94A3B8',
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
