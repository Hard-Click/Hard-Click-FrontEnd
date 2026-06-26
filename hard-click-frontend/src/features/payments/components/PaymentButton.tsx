'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoadingModal from '@/components/ui/loadingModal';
import type { OrderType } from '@/features/orders/types';
import { createCheckoutOrderAction } from '@/features/orders/actions';
import { getTossPayments, TOSS_CLIENT_KEY } from '@/features/payments/toss';

/**
 * 결제하기 버튼 (client).
 *
 * - **강의 결제(courseIds 1개 이상 + Client Key 설정)**: 결제 시점에 선택분으로 주문(orderNo)을
 *   재발급(금액·주문 일치) → 토스 SDK `requestPayment('카드', …)` → 결제창 → successUrl/failUrl로
 *   리다이렉트 → `/payment-result`에서 백엔드 승인(confirm) + 선택분 전체 수강 등록. (단건·장바구니 공통)
 * - **그 외(구독·Client Key 미설정)**: BE 결제 흐름이 없거나 키가 없어 mock 흐름 유지
 *   (처리 중 모달 → 성공 결과 페이지).
 */
export default function PaymentButton({
  orderNo,
  type,
  amount,
  courseIds,
  disabled = false,
}: {
  orderNo: string;
  type: OrderType;
  amount: number;
  /** 결제할 강의들 — 1개 이상이면 토스 실결제(결제 시점에 선택분으로 주문 재발급). 단건=[courseId] */
  courseIds?: number[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 토스 실결제 가능 조건: 강의 결제(선택분 1개 이상) + Client Key 설정됨
  const canToss =
    type === 'course' &&
    (courseIds?.length ?? 0) > 0 &&
    TOSS_CLIENT_KEY.length > 0;

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
        // 결제 시점의 선택분으로 주문(orderNo)을 새로 발급 → 토스 금액과 주문 총액 일치 보장
        const order = await createCheckoutOrderAction(type, courseIds!);
        if (!order) {
          toast.error('주문 생성에 실패했습니다. 다시 시도해주세요.');
          setProcessing(false);
          return;
        }
        // 안전장치(§0.1): 발급된 주문 금액이 화면 표시 금액과 다르면 결제 중단.
        // BE가 아직 선택분(courseIds)을 반영하지 않으면 전체 금액으로 주문이 발급될 수 있어
        // 표시액보다 더 청구되는 것을 막는다. (BE courseIds 지원 시 일치 → 정상 진행)
        if (order.amount !== amount) {
          toast.error(
            '선택하신 금액으로 주문이 생성되지 않았습니다. 전체 결제만 가능하거나 잠시 후 다시 시도해주세요.',
          );
          setProcessing(false);
          return;
        }
        const toss = await getTossPayments(TOSS_CLIENT_KEY);
        const origin = window.location.origin;
        const ids = courseIds!.join(',');
        // successUrl/failUrl엔 type·courseIds만 싣고, 토스가 paymentKey·orderId·amount를 덧붙임
        await toss.requestPayment('카드', {
          amount: order.amount,
          orderId: order.orderNo,
          orderName: order.orderName,
          successUrl: `${origin}/payment-result?type=course&courseIds=${ids}`,
          failUrl: `${origin}/payment-result?status=fail&type=course&courseIds=${ids}`,
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
