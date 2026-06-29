import type { SubscriptionInfo } from '../types';

/** YYYY-MM-DD → YYYY.MM.DD */
function dotDate(d: string): string {
  return d.replace(/-/g, '.');
}

const CalendarIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const ClockIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const CardIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
const SparkleWhite = (
  <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
  </svg>
);

/**
 * 구독 이용 내용 카드 (Server·표시용) — 구독 중 화면 하단.
 * 결제일 / 남은 기간(BE remainingDays) / 결제 금액. (실 만료일은 SubscriptionPlanCard에서 expiresAt로 표시)
 */
export default function SubscriptionStatusCard({
  info,
}: {
  info: SubscriptionInfo;
}) {
  const stats: { icon: React.ReactNode; label: string; value: string; accent: boolean }[] = [
    { icon: CalendarIcon, label: '결제일', value: info.paidAt ? dotDate(info.paidAt) : '-', accent: false },
    { icon: ClockIcon, label: '남은 기간', value: `${info.daysUntilSuneung}일`, accent: true },
    {
      icon: CardIcon,
      label: '결제 금액',
      value: info.paidAmount != null ? `${info.paidAmount.toLocaleString()}원` : '-',
      accent: false,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-4 border-b border-[#E2E8F0] pb-6">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F5DAA] to-[#1E3A8A]">
          {SparkleWhite}
        </span>
        <h2 className="flex-1 text-2xl font-bold text-[#1F2937]">{info.planName}</h2>
        <span className="rounded-[20px] bg-[#16A34A]/10 px-4 py-1.5 text-base font-semibold text-[#16A34A]">
          이용 중
        </span>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#F8FAFC] p-6">
            <div className="flex items-center gap-2 text-[#4B5563]">
              {s.icon}
              <span className="text-sm font-medium">{s.label}</span>
            </div>
            <p className={`mt-3 text-xl font-bold ${s.accent ? 'text-[#2F5DAA]' : 'text-[#1F2937]'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
