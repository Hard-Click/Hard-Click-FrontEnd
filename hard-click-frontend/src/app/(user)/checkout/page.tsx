import Image from 'next/image';
import Link from 'next/link';
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
  searchParams: Promise<{
    type?: string;
    courseId?: string;
    courseIds?: string;
  }>;
}) {
  const {
    type: typeParam,
    courseId: courseIdParam,
    courseIds: courseIdsParam,
  } = await searchParams;
  const type: OrderType =
    typeParam === 'subscription' ? 'subscription' : 'course';
  // 유료 수강신청에서 ?courseId=N으로 진입하면 단건 강의 결제.
  // 값이 있는데 유효하지 않으면 404 — 장바구니 결제로 폴백시키지 않는다(결제 대상 뒤바뀜 방지).
  let courseId: number | undefined;
  if (courseIdParam !== undefined) {
    if (!/^[1-9]\d*$/.test(courseIdParam)) notFound();
    courseId = Number(courseIdParam);
  }
  // 장바구니에서 선택분 결제로 진입하면 ?courseIds=1,2,3 (선택분만 주문).
  let courseIds: number[] | undefined;
  if (courseIdsParam !== undefined) {
    const parsed = courseIdsParam
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
    if (parsed.length === 0) notFound();
    courseIds = [...new Set(parsed)];
  }
  const order = await getCheckoutServer(type, courseId, courseIds);
  if (!order) notFound();

  // 이미 수강 중인 강의가 포함돼 BE가 주문을 거부(EN001)한 경우 — 404 대신 명확히 안내(이중결제 방지).
  // 진입 경로(단건 강의 상세=?courseId / 장바구니=?courseIds)에 맞춰 안내·이동을 분기한다.
  if ('blocked' in order) {
    const single = courseId !== undefined;
    const message = single
      ? '이미 수강 중인 강의라 결제할 수 없어요. 내 학습에서 바로 이어볼 수 있어요.'
      : '주문에 이미 수강 중인 강의가 포함되어 있어 결제를 진행할 수 없어요. 장바구니에서 해당 강의를 빼고 다시 시도해주세요.';
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-[1080px] px-8 py-12">
          <BackButton
            ariaLabel="이전으로 돌아가기"
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#4B5563] transition hover:text-[#1F2937]"
          >
            <Image src="/icons/arrowLeftIcon.svg" alt="" width={20} height={20} />{' '}
            이전으로 돌아가기
          </BackButton>
          <div className="mt-10 rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
            <h1 className="text-2xl font-bold text-[#1F2937]">
              이미 수강 중인 강의예요
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#64748B]">
              {message}
            </p>
            <div className="mt-7 flex justify-center gap-3">
              {single ? (
                <Link
                  href={`/learning/${courseId}`}
                  className="rounded-xl bg-[#2F5DAA] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#274C8B]"
                >
                  학습하기
                </Link>
              ) : (
                <Link
                  href="/cart"
                  className="rounded-xl bg-[#2F5DAA] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#274C8B]"
                >
                  장바구니로 가기
                </Link>
              )}
              <Link
                href="/courses"
                className="rounded-xl border border-[#E2E8F0] px-6 py-3 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
              >
                강의 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <CheckoutCourseClient order={order} />
        )}
      </div>
    </div>
  );
}
