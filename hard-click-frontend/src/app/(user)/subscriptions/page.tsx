import { getSubscriptionServer } from '@/features/subscriptions/server';
import SubscriptionPlanCard from '@/features/subscriptions/components/SubscriptionPlanCard';
import SubscriptionStatusCard from '@/features/subscriptions/components/SubscriptionStatusCard';

/** 미구독 하단 강조 카드 3개 */
const PROMO: {
  color: string;
  bg: string;
  title: string;
  desc: string;
  paths: React.ReactNode;
}[] = [
  {
    color: '#2F5DAA',
    bg: 'bg-[#2F5DAA]/10',
    title: '무제한 수강',
    desc: '모든 유료 강의를 제한 없이 학습하세요',
    paths: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </>
    ),
  },
  {
    color: '#16A34A',
    bg: 'bg-[#16A34A]/10',
    title: '학습 통계',
    desc: '진도율과 학습 기록이 자동으로 저장됩니다',
    paths: (
      <>
        <path d="M22 7 13.5 15.5l-5-5L2 17" />
        <path d="M16 7h6v6" />
      </>
    ),
  },
  {
    color: '#F59E0B',
    bg: 'bg-[#F59E0B]/10',
    title: '신규 강의',
    desc: '새로운 강의가 추가되면 자동으로 이용 가능',
    paths: (
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
    ),
  },
];

const HeroSparkle = (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFFFFF"
    strokeWidth="1.67"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
  </svg>
);

/**
 * 구독권 페이지 (Server Component) — `/subscriptions`.
 * 미구독: 구독 안내(혜택·가격) + 지금 구독하기 + 강조 카드 3개.
 * 구독 중: 혜택 카드 + 이용 내용 카드(하단). 상호작용 없음 → 전부 Server Component.
 */
export default async function SubscriptionPage() {
  const info = await getSubscriptionServer();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2F5DAA] to-[#1E3A8A] px-8 py-16 text-center text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-base font-semibold">
          {HeroSparkle} 연간 구독권
        </span>
        <h1 className="mt-6 text-4xl font-bold">FLOWN 연간 패스</h1>
        <p className="mt-4 text-xl text-white/90">
          연간 패스로 모든 유료 강의를 자유롭게 수강해보세요.
        </p>
        <p className="mt-2 text-lg text-white/80">제한 없이, 마음껏, 성장하세요.</p>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-[896px] px-8 py-12">
        <SubscriptionPlanCard info={info} />

        {info.subscribed ? (
          <div className="mt-8">
            <SubscriptionStatusCard info={info} />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PROMO.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center"
              >
                <span
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${p.bg}`}
                >
                  <svg
                    aria-hidden="true"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={p.color}
                    strokeWidth="2.33"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {p.paths}
                  </svg>
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#1F2937]">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-[#4B5563]">{p.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
