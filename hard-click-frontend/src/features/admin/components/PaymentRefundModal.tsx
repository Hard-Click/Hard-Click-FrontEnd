'use client';

import type { AdminPayment } from '@/features/payment/types';

interface PaymentRefundModalProps {
  payment: AdminPayment;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 환불 확인 모달 — 주문번호·사용자·금액 표시 후 환불 처리. */
export default function PaymentRefundModal({
  payment,
  onCancel,
  onConfirm,
}: PaymentRefundModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-title"
        aria-describedby="refund-message"
        className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-xl"
      >
        <h2
          id="refund-title"
          className="text-center text-2xl font-bold text-[#1F2937]"
        >
          환불 처리
        </h2>
        <p
          id="refund-message"
          className="mt-3 text-center text-base text-[#4B5563]"
        >
          <span className="font-semibold text-[#1F2937]">
            {payment.memberName}
          </span>
          님의 결제를 환불하시겠습니까?
          <br />
          <span className="text-sm text-[#64748B]">
            {payment.orderNo} · {payment.amount.toLocaleString()}원
          </span>
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 flex-1 rounded-[12px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] transition-colors hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 flex-1 rounded-[12px] bg-[#DC2626] text-base font-semibold text-white transition-colors hover:bg-[#B91C1C]"
          >
            환불
          </button>
        </div>
      </div>
    </div>
  );
}
