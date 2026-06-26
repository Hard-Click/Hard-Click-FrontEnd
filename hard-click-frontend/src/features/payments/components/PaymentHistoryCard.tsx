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

/** "2026-06-10T14:30:00" → "2026.06.10 14:30" (실패/삭제 행은 paidAt=null → '-') */
function formatPaidAt(iso: string | null): string {
  if (!iso) return '-';
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
  // 라이브가 enum에 없는 status를 주면(미래값 등) STATUS_STYLE 조회가 undefined가 되어
  // 카드 렌더 전체가 크래시(error.tsx) → 중립 배지로 폴백(실제 status 값을 라벨로 노출).
  const status = STATUS_STYLE[payment.status] ?? {
    label: payment.status ?? '알 수 없음',
    className: 'bg-[#4B5563]/10 text-[#4B5563]',
  };
  const items = payment.displayName
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const body = (
    <>
      {/* 상단: 주문번호 + 상태 / 금액 */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-[#1F2937]">
              {payment.orderNo ?? '주문번호 없음'}
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
    </>
  );

  const cardClass = 'block rounded-[20px] border border-[#E2E8F0] p-6';

  return (
    <li>
      {/*
        orderId 없는 결제(삭제된 강의)는 상세 이동 불가 → 비클릭 카드.
        ⚠️ orderId 있는 행도 상세(GET /api/order/{id})가 현재 BE C001(400, OrderStatus enum 버그)로
           깨져 있어 클릭 시 404 — 알려진 동작(BE 수정 시 자동 복구, getOrderDetailServer 주석 참고).
      */}
      {payment.orderId != null ? (
        <Link
          href={`/orders/${payment.orderId}`}
          className={`${cardClass} transition hover:border-[#CBD5E1] hover:bg-[#FAFBFC]`}
        >
          {body}
        </Link>
      ) : (
        <div className={cardClass}>{body}</div>
      )}
    </li>
  );
}
