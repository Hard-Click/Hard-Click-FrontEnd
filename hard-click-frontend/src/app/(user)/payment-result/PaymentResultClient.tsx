'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { confirmPaymentAction } from '@/features/payments/actions';

type Phase = 'confirming' | 'success' | 'fail';

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

const XCircleIcon = (
  <svg
    aria-hidden="true"
    width="44"
    height="44"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#DC2626"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6M9 9l6 6" />
  </svg>
);

/**
 * 결제 결과 (client) — 토스 successUrl/failUrl 리다이렉트 처리.
 *
 * - successUrl: 쿼리의 `paymentKey/orderId/amount` + `courseId`로 백엔드 승인(confirm) → 성공/실패
 * - failUrl: 쿼리의 `code/message`로 실패 안내 → 주문서로 복귀
 * - mock 흐름(구독·장바구니): `status=success`면 승인 없이 완료 화면
 */
export default function PaymentResultClient() {
  const sp = useSearchParams();

  const paymentKey = sp.get('paymentKey');
  const orderId = sp.get('orderId');
  const amountParam = sp.get('amount');
  const courseIdParam = sp.get('courseId');
  const type = sp.get('type');
  const status = sp.get('status');
  const failMessage = sp.get('message');

  const amountNum = amountParam ? Number(amountParam) : NaN;
  const courseId = courseIdParam ? Number(courseIdParam) : NaN;
  const isSubscription = type === 'subscription';
  const orderNo = sp.get('orderNo') ?? orderId ?? '';

  // 토스 success 진입(paymentKey+orderId+amount+courseId 전부 유효) → 승인 단계
  const canConfirm =
    !!paymentKey &&
    !!orderId &&
    Number.isFinite(amountNum) &&
    Number.isInteger(courseId);

  const [phase, setPhase] = useState<Phase>(() => {
    if (status === 'fail') return 'fail';
    if (canConfirm) return 'confirming';
    if (status === 'success' && Number.isFinite(amountNum)) return 'success';
    return 'fail';
  });
  const [errorMsg, setErrorMsg] = useState<string>(
    failMessage || '결제가 정상적으로 처리되지 않았습니다.',
  );

  // confirm은 토스 success 진입 시 1회만 호출 (setState는 전부 비동기 콜백에서 → effect 동기 setState 회피)
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'confirming' || confirmedRef.current || !canConfirm) return;
    confirmedRef.current = true;
    confirmPaymentAction({
      paymentKey: paymentKey!,
      orderId: orderId!,
      amount: amountNum,
      courseId,
    })
      .then((res) => {
        if (res.success) {
          setPhase('success');
        } else {
          setErrorMsg(res.message || '결제 승인에 실패했습니다.');
          setPhase('fail');
        }
      })
      .catch(() => {
        setErrorMsg('결제 승인 중 오류가 발생했습니다.');
        setPhase('fail');
      });
  }, [phase, canConfirm, paymentKey, orderId, amountNum, courseId]);

  if (phase === 'confirming') {
    return (
      <Card>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#E5E9F0] border-t-[#2F5DAA]" />
        <h1 className="mt-6 text-xl font-bold text-[#0F172A]">
          결제를 승인하고 있어요
        </h1>
        <p className="mt-2 text-[15px] text-[#64748B]">
          잠시만 기다려주세요...
        </p>
      </Card>
    );
  }

  if (phase === 'fail') {
    const backHref =
      type === 'course' && Number.isInteger(courseId)
        ? `/checkout?type=course&courseId=${courseId}`
        : '/courses';
    return (
      <Card>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#DC2626]/10">
          {XCircleIcon}
        </div>
        <h1 className="mt-6 text-2xl font-bold text-[#0F172A]">
          결제에 실패했습니다
        </h1>
        <p className="mt-2 break-keep text-[15px] text-[#64748B]">{errorMsg}</p>
        <div className="mt-8 flex gap-3">
          <Link
            href={backHref}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#2F5DAA] text-base font-semibold text-white transition hover:bg-[#274C8B]"
          >
            다시 시도
          </Link>
          <Link
            href="/courses"
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] text-base font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            강의 둘러보기
          </Link>
        </div>
      </Card>
    );
  }

  // success
  return (
    <Card>
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
          <span className="text-sm font-medium text-[#1F2937]">{orderNo}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-[#64748B]">결제 금액</span>
          <span className="text-sm font-bold text-[#2F5DAA]">
            {Number.isFinite(amountNum) ? amountNum.toLocaleString() : '-'}원
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
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-8 py-16">
      <div className="w-full max-w-[480px] rounded-2xl border border-[#E5E9F0] bg-white p-10 text-center shadow-[0_1px_3px_rgba(16,24,40,0.05),0_16px_32px_-16px_rgba(16,24,40,0.16)]">
        {children}
      </div>
    </div>
  );
}
