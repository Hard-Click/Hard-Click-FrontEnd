'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoadingModal from '@/components/ui/loadingModal';
import type { OrderType } from '@/features/orders/types';

/**
 * 결제하기 버튼 (client).
 * mock 흐름: 처리 중 모달 → 성공 토스트 + 결과 페이지 이동 / (실패 시) 실패 토스트 + 머무름.
 * 실연동: 토스 SDK `requestPayment({ successUrl, failUrl })` → successUrl(서버 승인)/failUrl(code·message).
 */
export default function PaymentButton({
  orderNo,
  type,
  amount,
  disabled = false,
}: {
  orderNo: string;
  type: OrderType;
  amount: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 언마운트 시 진행 중인 mock 타이머 정리 (콜백이 언마운트 뒤 실행되는 것 방지)
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handlePay = () => {
    if (disabled || processing) return;
    setProcessing(true);

    // TODO(API 연동): 토스 SDK 결제창 호출. 지금은 mock으로 처리 흐름만 재현.
    timerRef.current = window.setTimeout(() => {
      const success = true; // mock 성공. 실연동 시 토스 successUrl/failUrl 결과로 분기
      if (success) {
        toast.success('결제가 완료되었습니다');
        router.push(
          `/payment-result?status=success&orderNo=${encodeURIComponent(orderNo)}&type=${type}&amount=${amount}`,
        );
      } else {
        toast.error('결제에 실패하였습니다');
        setProcessing(false);
      }
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
