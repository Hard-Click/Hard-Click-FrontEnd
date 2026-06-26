import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCheckoutServer } from '@/features/orders/server';
import type { OrderType } from '@/features/orders/types';
import CheckoutCourseClient from '@/features/orders/components/CheckoutCourseClient';
import OrderAmountSummary from '@/features/orders/components/OrderAmountSummary';
import BackButton from '@/components/common/BackButton';

const SparkleIcon = (
  <svg
    aria-hidden="true"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFFFFF"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
  </svg>
);

/**
 * 주문/결제 페이지 (Server Component) — `/checkout?type=course|subscription`.
 * 단건 강의(선택 결제·client) / 구독(FLOWN 연간 패스·static) 겸용. 동시 결제 없음.
 * 구매자 정보·결제 수단은 Toss 결제창이 처리하므로 페이지엔 없음.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; courseId?: string }>;
}) {
  const { type: typeParam, courseId: courseIdParam } = await searchParams;
  const type: OrderType =
    typeParam === 'subscription' ? 'subscription' : 'course';
  // 유료 수강신청에서 ?courseId=N으로 진입하면 단건 강의 결제.
  // 값이 있는데 유효하지 않으면 404 — 장바구니 결제로 폴백시키지 않는다(결제 대상 뒤바뀜 방지).
  let courseId: number | undefined;
  if (courseIdParam !== undefined) {
    if (!/^[1-9]\d*$/.test(courseIdParam)) notFound();
    courseId = Number(courseIdParam);
  }
  const order = await getCheckoutServer(type, courseId);
  if (!order) notFound();

  // 구독 결제는 항상 단일 상품(FLOWN 연간 패스) — 빈 배열은 비정상이므로 방어
  if (order.type === 'subscription' && order.items.length === 0) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1080px] px-8 py-12">
        {/* 이전으로 돌아가기 — 전 페이지(장바구니·강의 상세)로 (앱 공통 형식) */}
        <BackButton
          ariaLabel="이전으로 돌아가기"
          className="inline-flex items-center gap-1.5 text-base font-semibold text-[#4B5563] transition hover:text-[#1F2937]"
        >
          <Image src="/icons/arrowLeftIcon.svg" alt="" width={20} height={20} /> 이전으로
          돌아가기
        </BackButton>

        {/* 헤더 */}
        <header className="mt-5">
          <h1 className="text-[28px] font-bold text-[#1F2937]">주문/결제</h1>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-[15px] text-[#64748B]">주문번호: {order.orderNo}</p>
            <span className="rounded-full bg-[#F59E0B]/10 px-3 py-1 text-[13px] font-semibold text-[#F59E0B]">
              결제 대기
            </span>
          </div>
        </header>

        {order.type === 'subscription' ? (
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
            <section className="flex-1 rounded-2xl border border-[#E5E9F0] bg-white p-8 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_16px_32px_-16px_rgba(16,24,40,0.16)]">
              <h2 className="text-xl font-bold text-[#0F172A]">구독 상품</h2>
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#2F5DAA] bg-[#2F5DAA]/[0.04] p-4">
                <span className="flex h-16 w-[88px] flex-shrink-0 items-center justify-center rounded-xl bg-[#2F5DAA]">
                  {SparkleIcon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    {order.items[0].title}
                  </h3>
                  {order.items[0].subtitle && (
                    <p className="mt-1 text-sm text-[#64748B]">
                      {order.items[0].subtitle}
                    </p>
                  )}
                </div>
                <p className="flex-shrink-0 text-lg font-bold text-[#2F5DAA]">
                  {order.items[0].price.toLocaleString()}원
                </p>
              </div>
            </section>

            <div className="w-full lg:w-[348px] lg:flex-shrink-0">
              <OrderAmountSummary
                orderNo={order.orderNo}
                type={order.type}
                totalAmount={order.totalAmount}
                finalAmount={order.finalAmount}
              />
            </div>
          </div>
        ) : (
          <CheckoutCourseClient order={order} courseId={courseId} />
        )}
      </div>
    </div>
  );
}
