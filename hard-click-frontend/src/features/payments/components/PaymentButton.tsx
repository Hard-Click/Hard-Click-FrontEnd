'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoadingModal from '@/components/ui/loadingModal';
import type { OrderType } from '@/features/orders/types';
import { getTossPayments, TOSS_CLIENT_KEY } from '@/features/payments/toss';

/**
 * 결제하기 버튼 (client).
 *
 * - **단건 강의 결제(courseId 有 + Client Key 설정)**: 토스 SDK `requestPayment('카드', …)` 호출 →
 *   토스 결제창 → successUrl/failUrl로 리다이렉트 → `/payment-result`에서 백엔드 승인(confirm).
 * - **그 외(구독·장바구니·Client Key 미설정)**: BE 결제 엔드포인트가 없거나 키가 없어 mock 흐름 유지
 *   (처리 중 모달 → 성공 결과 페이지).
 */
export default function PaymentButton({
  orderNo,
  type,
  amount,
  courseId,
  orderName,
  disabled = false,
}: {
  orderNo: string;
  type: OrderType;
  amount: number;
  /** 단건 강의 결제 시 강의 식별자(있으면 토스 실결제 흐름) */
  courseId?: number;
  /** 상품명(토스 orderName) */
  orderName?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 토스 실결제 가능 조건: 단건 강의 + Client Key 설정됨
  const canToss = type === 'course' && !!courseId && TOSS_CLIENT_KEY.length > 0;

  // 언마운트 시 진행 중인 mock 타이머 정리 (콜백이 언마운트 뒤 실행되는 것 방지)
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handlePay = async () => {
    if (disabled || processing) return;
    setProcessing(true);

    if (canToss) {
      try {
        const toss = await getTossPayments(TOSS_CLIENT_KEY);
        const origin = window.location.origin;
        // successUrl/failUrl엔 type·courseId만 싣고, 토스가 paymentKey·orderId·amount를 덧붙임
        await toss.requestPayment('카드', {
          amount,
          orderId: orderNo,
          orderName: orderName ?? '강의 수강',
          successUrl: `${origin}/payment-result?type=course&courseId=${courseId}`,
          failUrl: `${origin}/payment-result?status=fail&type=course&courseId=${courseId}`,
        });
        // 결제창에서 리다이렉트되므로 정상 흐름에선 이 아래로 오지 않는다.
      } catch {
        // 사용자가 결제창을 닫음 / SDK 로드 실패 등
        toast.error('결제가 취소되었습니다.');
        setProcessing(false);
      }
      return;
    }

    // mock 흐름 (구독·장바구니·Client Key 미설정) — 처리 흐름만 재현
    timerRef.current = window.setTimeout(() => {
      toast.success('결제가 완료되었습니다');
      router.push(
        `/payment-result?status=success&orderNo=${encodeURIComponent(orderNo)}&type=${type}&amount=${amount}`,
      );
    }, 1200);
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || processing}
        className={`flex h-14 w-full items-center justify-center rounded-xl text-lg font-bold text-white transition ${
          disabled || processing
            ? 'cursor-not-allowed bg-[#94A3B8]'
            : 'bg-[#2F5DAA] shadow-[0_8px_16px_-4px_rgba(47,93,170,0.4)] hover:bg-[#274C8B]'
        }`}
      >
        {amount.toLocaleString()}원 결제하기
      </button>

      {processing && (
        <LoadingModal
          title="결제 처리 중입니다"
          description="잠시만 기다려주세요..."
        />
      )}
    </>
  );
}
