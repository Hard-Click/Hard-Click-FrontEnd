import { Suspense } from 'react';
import PaymentResultClient from './PaymentResultClient';

/**
 * 결제 결과 페이지 — `/payment-result`.
 * 토스 successUrl/failUrl 리다이렉트가 도달하는 곳. 실제 처리(승인 confirm·성공/실패 분기)는
 * client(`PaymentResultClient`)에서 쿼리스트링(paymentKey/orderId/amount/code/message)으로 수행.
 * (`useSearchParams`는 Suspense 경계가 필요)
 */
export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E5E9F0] border-t-[#2F5DAA]" />
        </div>
      }
    >
      <PaymentResultClient />
    </Suspense>
  );
}
