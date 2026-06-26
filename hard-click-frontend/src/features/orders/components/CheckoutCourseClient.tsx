'use client';

import { useState } from 'react';
import OrderCourseList from './OrderCourseList';
import OrderAmountSummary from './OrderAmountSummary';
import type { OrderSummary } from '../types';

const CheckIcon = (
  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * 단건 결제 본문 (client) — 주문 강의 선택(체크박스) + 선택 합계 결제.
 * 체크 해제 시 결제금액에서 제외. 좌(주문 강의) + 우(결제 금액)가 선택 상태를 공유.
 */
export default function CheckoutCourseClient({
  order,
}: {
  order: OrderSummary;
}) {
  const [selected, setSelected] = useState<boolean[]>(() =>
    order.items.map(() => true),
  );

  const allSelected = selected.every(Boolean);
  const selectedCount = selected.filter(Boolean).length;
  const selectedTotal = order.items.reduce(
    (sum, item, i) => sum + (selected[i] ? item.price : 0),
    0,
  );

  const toggle = (index: number) =>
    setSelected((prev) => prev.map((v, i) => (i === index ? !v : v)));
  const toggleAll = () => {
    const next = !allSelected;
    setSelected(order.items.map(() => next));
  };

  // 결제 시점에 주문을 재발급할 선택분 courseIds (item.id = courseId).
  // 단건·장바구니 공통 — PaymentButton이 이 목록으로 orderNo를 새로 발급한다.
  const selectedCourseIds = order.items
    .filter((_, i) => selected[i])
    .map((it) => it.id);

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
      <section className="flex-1 rounded-2xl border border-[#E5E9F0] bg-white p-8 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_16px_32px_-16px_rgba(16,24,40,0.16)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0F172A]">주문 강의</h2>
          {/* 전체 선택 — 라벨 오른쪽에 체크박스 */}
          <button
            type="button"
            onClick={toggleAll}
            aria-pressed={allSelected}
            className="flex items-center gap-2 text-sm font-medium text-[#475569] transition hover:text-[#1F2937]"
          >
            전체 선택
            <span
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-2 transition ${
                allSelected
                  ? 'border-[#2F5DAA] bg-[#2F5DAA]'
                  : 'border-[#CBD5E1] bg-white'
              }`}
            >
              {allSelected && CheckIcon}
            </span>
          </button>
        </div>
        <div className="mt-5">
          <OrderCourseList
            items={order.items}
            selected={selected}
            onToggle={toggle}
          />
        </div>
      </section>

      <div className="w-full lg:w-[348px] lg:flex-shrink-0">
        <OrderAmountSummary
          orderNo={order.orderNo}
          type={order.type}
          totalAmount={selectedTotal}
          finalAmount={selectedTotal}
          courseIds={selectedCourseIds}
          disabled={selectedCount === 0}
        />
      </div>
    </div>
  );
}
