import Link from 'next/link';
import type { SubscriptionInfo } from '../types';

/** YYYY-MM-DD → YYYY.MM.DD */
function dotDate(d: string): string {
  return d.replace(/-/g, '.');
}

/** 혜택별 아이콘/색 (디자인 5개 — index 매칭, 초과 시 순환) */
const BENEFIT_META: { color: string; bg: string; paths: React.ReactNode }[] = [
  {
    color: '#2F5DAA',
    bg: 'bg-[#2F5DAA]/10',
    paths: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </>
    ),
  },
  {
    color: '#F59E0B',
    bg: 'bg-[#F59E0B]/10',
    paths: (
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
    ),
  },
  {
    color: '#16A34A',
    bg: 'bg-[#16A34A]/10',
    paths: (
      <>
        <path d="M22 7 13.5 15.5l-5-5L2 17" />
        <path d="M16 7h6v6" />
      </>
    ),
  },
  {
    color: '#8B5CF6',
    bg: 'bg-[#8B5CF6]/10',
    paths: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </>
    ),
  },
  {
    color: '#06B6D4',
    bg: 'bg-[#06B6D4]/10',
    paths: (
      <>
        <line x1="12" x2="12" y1="20" y2="10" />
        <line x1="18" x2="18" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="16" />
      </>
    ),
  },
];

const CheckIcon = (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#16A34A"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ArrowRightIcon = (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/**
 * 구독권 빅 카드 (Server·표시용) — 미구독/구독 중 겸용.
 * - 미구독: 가격(오늘 D-day 기준) + 지금 구독하기(→ 결제)
 * - 구독 중: 가격 숫자 생략 + "이미 이용 중" + 구독 중(비활성). 결제 금액은 별도 상태 카드.
 */
export default function SubscriptionPlanCard({
  info,
}: {
  info: SubscriptionInfo;
}) {
  const notices = [
    `구독권은 결제일부터 수능일(${dotDate(info.suneungDate)})까지 유효합니다.`,
    '구독 기간 중 추가되는 모든 신규 강의를 자동으로 수강할 수 있습니다.',
    '환불은 남은 이용 기간에 비례하여 일할 계산됩니다.',
    '구독 취소 후에도 만료일까지는 서비스를 이용할 수 있습니다.',
  ];

  return (
    <section className="rounded-3xl border-2 border-[#2F5DAA] bg-white p-10 shadow-[0_8px_24px_rgba(47,93,170,0.15)]">
      {/* 헤더 */}
      <div className="border-b-2 border-[#E2E8F0] pb-8 text-center">
        <h2 className="text-3xl font-bold text-[#1F2937]">{info.planName}</h2>
        {!info.subscribed && (
          <>
            <p className="mt-4">
              <span className="text-5xl font-bold text-[#2F5DAA]">
                {info.currentPrice.toLocaleString()}
              </span>
              <span className="ml-1 text-2xl text-[#4B5563]">원</span>
            </p>
            <p className="mt-3 text-lg text-[#4B5563]">
              수능일까지 · D-{info.daysUntilSuneung}
            </p>
          </>
        )}
      </div>

      {/* 혜택 */}
      <div className="mt-8">
        <h3 className="flex items-center gap-2 text-xl font-bold text-[#1F2937]">
          {CheckIcon}
          이런 혜택을 받을 수 있어요
        </h3>
        <ul className="mt-6 flex flex-col gap-4">
          {info.benefits.map((benefit, i) => {
            const m = BENEFIT_META[i % BENEFIT_META.length];
            return (
              <li
                key={benefit}
                className="flex items-center gap-4 rounded-[20px] bg-[#F8FAFC] p-4"
              >
                <span
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${m.bg}`}
                >
                  <svg
                    aria-hidden="true"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={m.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {m.paths}
                  </svg>
                </span>
                <span className="flex-1 text-lg font-semibold text-[#1F2937]">
                  {benefit}
                </span>
                {CheckIcon}
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA */}
      {info.subscribed ? (
        <>
          <div className="mt-8 rounded-[20px] border-2 border-[#16A34A] bg-[#16A34A]/10 p-6 text-center">
            <p className="text-lg font-bold text-[#16A34A]">
              이미 이용 중인 구독권입니다
            </p>
            <p className="mt-2 text-base text-[#4B5563]">
              구독 만료일: {dotDate(info.suneungDate)}
            </p>
          </div>
          <div className="mt-4 flex h-16 items-center justify-center rounded-[20px] bg-[#E2E8F0] text-lg font-bold text-[#9CA3AF]">
            구독 중
          </div>
        </>
      ) : (
        <Link
          href="/checkout"
          className="mt-8 flex h-16 items-center justify-center gap-3 rounded-[20px] bg-[#2F5DAA] text-lg font-bold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] transition hover:bg-[#274C8B]"
        >
          지금 구독하기 {ArrowRightIcon}
        </Link>
      )}

      {/* 유의사항 */}
      <div className="mt-8 rounded-[20px] bg-[#F8FAFC] p-5">
        <h4 className="text-sm font-bold text-[#1F2937]">유의사항</h4>
        <ul className="mt-3 flex flex-col gap-2">
          {notices.map((n) => (
            <li key={n} className="text-sm text-[#4B5563]">
              • {n}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
