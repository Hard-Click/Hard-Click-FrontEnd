import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getOrderDetailServer } from '@/features/payments/server';
import OrderRefundView from '@/features/payments/components/OrderRefundView';
import BackButton from '@/components/common/BackButton';
import type { OrderStatus } from '@/features/payments/types';

const STATUS_STYLE: Record<OrderStatus, { label: string; className: string }> = {
  PAID: { label: '결제완료', className: 'bg-[#16A34A]/10 text-[#16A34A]' },
  REFUNDED: { label: '환불완료', className: 'bg-[#4B5563]/10 text-[#4B5563]' },
  FAILED: { label: '결제실패', className: 'bg-[#B91C1C]/10 text-[#B91C1C]' },
};

const BoxIcon = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F5DAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
);
const CardIcon = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F5DAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
const CalendarIcon = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F5DAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
/** "2026-05-12T14:30:00" → "2026.05.12 14:30" */
function formatDateTime(iso: string): string {
  const [date, time] = iso.split('T');
  if (!date) return iso;
  const d = date.replace(/-/g, '.');
  return time ? `${d} ${time.slice(0, 5)}` : d;
}

/**
 * 주문 상세 페이지 (Server Component) — `/orders/[orderId]`.
 * 주문 정보 · 주문 내역 · (PAID면) 환불 안내. 결제 내역 카드 클릭 시 진입.
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const parsedOrderId = Number(orderId);
  if (!Number.isFinite(parsedOrderId)) notFound();
  const order = await getOrderDetailServer(parsedOrderId);
  if (!order) notFound();

  const status = STATUS_STYLE[order.status];
  const infoCols = [
    { key: 'state', icon: BoxIcon, label: '주문 상태', value: status.label },
    { key: 'method', icon: CardIcon, label: '결제 수단', value: order.paymentMethod },
    { key: 'paidAt', icon: CalendarIcon, label: '결제일시', value: formatDateTime(order.paidAt) },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1080px] px-8 py-12">
        {/* 이전으로 돌아가기 */}
        <BackButton
          ariaLabel="이전으로 돌아가기"
          className="inline-flex items-center gap-1.5 text-base font-semibold text-[#4B5563] transition hover:text-[#1F2937]"
        >
          <Image src="/icons/arrowLeftIcon.svg" alt="" width={20} height={20} /> 이전으로
          돌아가기
        </BackButton>
        <h1 className="mt-5 text-[28px] font-bold text-[#1F2937]">주문 상세</h1>

        {/* 주문 정보 */}
        <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#1F2937]">
                주문번호: {order.orderNo}
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                주문일시: {formatDateTime(order.orderedAt)}
              </p>
            </div>
            <span
              className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 border-t border-[#E2E8F0] pt-5 sm:grid-cols-3">
            {infoCols.map((col) => (
              <div key={col.key} className="flex items-center gap-3">
                {col.icon}
                <div className="min-w-0">
                  <p className="text-sm text-[#64748B]">{col.label}</p>
                  <p className="mt-0.5 font-semibold text-[#1F2937]">{col.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 주문 내역 + 환불 안내 (선택 상태 공유 client) */}
        <OrderRefundView order={order} />
      </div>
    </div>
  );
}
