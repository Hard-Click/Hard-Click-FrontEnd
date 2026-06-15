import Link from 'next/link';
import type { PaymentHistory, PaymentStatus } from '../types';

/** 상태별 라벨·배지색 (완료/환불완료/실패/대기/취소) */
const STATUS_STYLE: Record<PaymentStatus, { label: string; className: string }> =
  {
    PAID: { label: '완료', className: 'bg-[#16A34A]/10 text-[#16A34A]' },
    REFUNDED: { label: '환불완료', className: 'bg-[#4B5563]/10 text-[#4B5563]' },
    FAILED: { label: '실패', className: 'bg-[#B91C1C]/10 text-[#B91C1C]' },
    READY: { label: '결제 대기', className: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
    CANCELED: { label: '취소', className: 'bg-[#4B5563]/10 text-[#4B5563]' },
  };

/** "2026-06-10T14:30:00" → "2026.06.10 14:30" */
function formatPaidAt(iso: string): string {
  const [date, time] = iso.split('T');
  if (!date) return iso;
  const d = date.replace(/-/g, '.');
  return time ? `${d} ${time.slice(0, 5)}` : d;
}

/**
 * 결제 내역 카드 (Server·표시 전용) — 주문번호·상태 배지·일시·금액·주문 항목.
 * 단건은 항목 여러 개(", "로 연결)일 수 있어 불릿으로 분리 표시.
 */
export default function PaymentHistoryCard({
  payment,
}: {
  payment: PaymentHistory;
}) {
  const status = STATUS_STYLE[payment.status];
  const items = payment.displayName
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <li>
      <Link
        href={`/orders/${payment.orderId}`}
        className="block rounded-[20px] border border-[#E2E8F0] p-6 transition hover:border-[#CBD5E1] hover:bg-[#FAFBFC]"
      >
        {/* 상단: 주문번호 + 상태 / 금액 */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-[#1F2937]">
              {payment.orderNo}
            </h3>
            <span
              className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-[#4B5563]">
            {formatPaidAt(payment.paidAt)}
          </p>
        </div>
        <p className="flex-shrink-0 text-2xl font-bold text-[#2F5DAA]">
          {payment.amount.toLocaleString()}원
        </p>
      </div>

      {/* 구분선 + 주문 항목 */}
      <div className="mt-5 border-t border-[#E2E8F0] pt-4">
        <p className="text-sm font-medium text-[#4B5563]">주문 항목</p>
        <ul className="mt-2 space-y-1">
          {items.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="text-sm font-medium text-[#1F2937]"
            >
              • {name}
            </li>
          ))}
        </ul>
      </div>
      </Link>
    </li>
  );
}
