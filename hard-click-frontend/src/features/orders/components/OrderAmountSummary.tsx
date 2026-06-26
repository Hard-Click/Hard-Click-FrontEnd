import PaymentButton from '@/features/payments/components/PaymentButton';
import type { OrderType } from '../types';

/**
 * 결제 금액 카드 (표시용 — server/client 양쪽에서 사용 가능).
 * 금액은 props로 받아 단건(선택 합계)·구독(고정) 모두 대응. 결제하기만 client 섬.
 */
export default function OrderAmountSummary({
  orderNo,
  type,
  totalAmount,
  finalAmount,
  courseIds,
  disabled = false,
}: {
  orderNo: string;
  type: OrderType;
  totalAmount: number;
  finalAmount: number;
  /** 결제할 강의들(선택분) — 토스 실결제 흐름용. 구독은 미전달 */
  courseIds?: number[];
  disabled?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-[#E5E9F0] bg-white p-8 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_16px_32px_-16px_rgba(16,24,40,0.16)]">
      <h2 className="text-xl font-bold text-[#0F172A]">결제 금액</h2>

      <div className="mt-7 flex items-center justify-between">
        <span className="text-[15px] text-[#64748B]">총 상품금액</span>
        <span className="text-[15px] font-semibold text-[#1F2937]">
          {totalAmount.toLocaleString()}원
        </span>
      </div>

      <div className="my-5 h-px bg-[#EEF1F5]" />

      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-[#1F2937]">최종 결제금액</span>
        <span className="text-[26px] font-extrabold leading-none tracking-tight text-[#2F5DAA]">
          {finalAmount.toLocaleString()}원
        </span>
      </div>

      <div className="mt-7">
        <PaymentButton
          orderNo={orderNo}
          type={type}
          amount={finalAmount}
          courseIds={courseIds}
          disabled={disabled}
        />
      </div>

      <p className="mt-4 break-keep text-center text-xs leading-5 text-[#94A3B8]">
        결제 버튼을 클릭하시면 결제 대행사(Toss&nbsp;Payments) 결제창으로
        이동합니다.
      </p>
    </section>
  );
}
