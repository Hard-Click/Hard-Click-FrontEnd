import Link from 'next/link';
import { notFound } from 'next/navigation';

const CheckCircleIcon = (
  <svg
    aria-hidden="true"
    width="44"
    height="44"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#16A34A"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

/**
 * 결제 결과 페이지 (Server Component) — `/payment-result`.
 * 성공 전용(실패는 체크아웃에서 토스트로 처리). 토스 successUrl에서 서버 승인 후 도달.
 * 연동 시: paymentKey·orderId·amount로 서버 승인(confirm) → 이 화면.
 */
export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    orderNo?: string;
    type?: string;
    amount?: string;
  }>;
}) {
  const { status, orderNo, amount, type } = await searchParams;
  if (status !== 'success') notFound(); // 성공 전용

  const amountNum = Number(amount) || 0;
  const isSubscription = type === 'subscription';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-8 py-16">
      <div className="w-full max-w-[480px] rounded-2xl border border-[#E5E9F0] bg-white p-10 text-center shadow-[0_1px_3px_rgba(16,24,40,0.05),0_16px_32px_-16px_rgba(16,24,40,0.16)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#16A34A]/10">
          {CheckCircleIcon}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[#0F172A]">
          결제가 완료되었습니다
        </h1>
        <p className="mt-2 text-[15px] text-[#64748B]">
          주문이 정상적으로 처리되었어요.
        </p>

        <div className="mt-8 rounded-xl bg-[#F8FAFC] p-5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#64748B]">주문번호</span>
            <span className="text-sm font-medium text-[#1F2937]">
              {orderNo ?? '-'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-[#64748B]">결제 금액</span>
            <span className="text-sm font-bold text-[#2F5DAA]">
              {amountNum.toLocaleString()}원
            </span>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href={isSubscription ? '/courses' : '/mypage/courses/in-progress'}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#2F5DAA] text-base font-semibold text-white transition hover:bg-[#274C8B]"
          >
            {isSubscription ? '강의 둘러보기' : '내 학습 바로가기'}
          </Link>
          <Link
            href={isSubscription ? '/subscriptions' : '/courses'}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] text-base font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            {isSubscription ? '구독 확인' : '홈으로'}
          </Link>
        </div>
      </div>
    </div>
  );
}
