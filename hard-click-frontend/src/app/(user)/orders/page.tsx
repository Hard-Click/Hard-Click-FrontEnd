import Image from 'next/image';
import { getMyPaymentsServer } from '@/features/payments/server';
import PaymentHistoryCard from '@/features/payments/components/PaymentHistoryCard';
import BackButton from '@/components/common/BackButton';

const CardIcon = (
  <svg
    aria-hidden="true"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFFFFF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

/**
 * 결제 내역 페이지 (Server Component) — `/orders`.
 * 프로필 드롭다운 "결제 내역" 진입. 단건·구독 결제 내역을 상태와 함께 최신순 표시.
 */
export default async function OrdersPage() {
  const payments = await getMyPaymentsServer();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1080px] px-8 py-12">
        {/* 이전으로 돌아가기 — 앱 공통 형식(체크아웃·퀴즈와 통일) */}
        <BackButton
          ariaLabel="이전으로 돌아가기"
          className="inline-flex items-center gap-1.5 text-base font-semibold text-[#4B5563] transition hover:text-[#1F2937]"
        >
          <Image src="/icons/arrowLeftIcon.svg" alt="" width={20} height={20} /> 이전으로
          돌아가기
        </BackButton>

        {/* 헤더: 아이콘 + 제목/부제 */}
        <div className="mt-5 flex items-center gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#2F5DAA]">
            {CardIcon}
          </span>
          <div>
            <h1 className="text-[28px] font-bold text-[#1F2937]">결제 내역</h1>
            <p className="mt-1 text-[15px] text-[#64748B]">
              주문 및 결제 내역을 확인하세요.
            </p>
          </div>
        </div>

        {/* 본문: 목록 / 빈 상태 */}
        <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/emptyStateIcon.svg"
                width={80}
                height={80}
                alt=""
              />
              <h2 className="mt-6 text-2xl font-bold text-[#1F2937]">
                결제한 강의 내역이 없습니다.
              </h2>
              <p className="mt-2 text-[15px] text-[#64748B]">
                새로운 강의를 신청하고 학습을 시작해보세요.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {payments.map((p) => (
                <PaymentHistoryCard key={p.paymentId} payment={p} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
