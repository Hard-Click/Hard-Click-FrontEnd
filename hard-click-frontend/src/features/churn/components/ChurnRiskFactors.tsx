import type { ChurnRiskFactor } from '../types';

/** 위험 점수 기여 요인 카드 (Server Component — 정적 바). */
export default function ChurnRiskFactors({
  factors,
}: {
  factors: ChurnRiskFactor[];
}) {
  const maxDelta = Math.max(...factors.map((f) => f.delta), 1);

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#1E293B]">위험 점수 기여 요인</h2>
      <p className="mb-5 text-sm text-[#94A3B8]">무엇이 이 학생을 위험하게 만드는가</p>

      <ul className="space-y-4">
        {factors.map((f) => {
          const isHigh = f.delta >= 25;
          const color = isHigh ? '#EF4444' : '#F59E0B';
          return (
            <li key={f.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm text-[#475569]">{f.label}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color }}
                >
                  +{f.delta}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((f.delta / maxDelta) * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
