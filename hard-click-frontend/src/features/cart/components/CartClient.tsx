'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/confirmModal';
import LoadingModal from '@/components/ui/loadingModal';
import CarItem from './CarItem';
import CartSummary from './CartSummary';
import CartEmptyState from './CartEmptyState';
import { removeCartItemsAction } from '../actions';
import type { Cart } from '../types';

const CheckIcon = (
  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * 장바구니 client 오케스트레이터 — 선택/삭제 상태 공유.
 * 항목별·전체 선택, 개별·전체 삭제(확인 모달→로딩→토스트), 선택 합계, 결제/둘러보기.
 * 삭제는 optimistic(removedIds) — 연동 시 revalidate로 서버 상태 반영.
 */
export default function CartClient({ cart }: { cart: Cart }) {
  const router = useRouter();
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(cart.items.map((it) => [it.cartItemId, true])),
  );
  const [pending, setPending] = useState<{ ids: number[]; all: boolean } | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);

  const items = cart.items.filter((it) => !removedIds.includes(it.cartItemId));
  const selectedItems = items.filter((it) => selected[it.cartItemId]);
  const selectedCount = selectedItems.length;
  const selectedTotal = selectedItems.reduce((sum, it) => sum + it.price, 0);
  const allSelected =
    items.length > 0 && items.every((it) => selected[it.cartItemId]);

  const toggle = (id: number) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const next = !allSelected;
    setSelected((prev) => {
      const copy = { ...prev };
      items.forEach((it) => (copy[it.cartItemId] = next));
      return copy;
    });
  };

  const handleCheckout = () => {
    if (selectedCount === 0) return;
    router.push('/checkout?type=course');
  };

  const handleConfirmRemove = async () => {
    if (!pending) return;
    const ids = pending.ids;
    setProcessing(true);
    try {
      const res = await removeCartItemsAction(ids);
      if (res.success) {
        setRemovedIds((prev) => [...prev, ...ids]);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('삭제에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setProcessing(false);
      setPending(null);
    }
  };

  if (items.length === 0) return <CartEmptyState />;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* 좌: 목록 */}
      <section className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
        {/* 전체 선택 / 전체 삭제 */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-5">
          <button
            type="button"
            onClick={toggleAll}
            aria-pressed={allSelected}
            className="flex items-center gap-3"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${
                allSelected
                  ? 'border-[#2F5DAA] bg-[#2F5DAA]'
                  : 'border-[#CBD5E1] bg-white'
              }`}
            >
              {allSelected && CheckIcon}
            </span>
            <span className="text-base font-semibold text-[#1F2937]">
              전체 선택
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              setPending({ ids: items.map((it) => it.cartItemId), all: true })
            }
            className="text-sm font-semibold text-[#B91C1C] transition hover:text-[#991B1B]"
          >
            전체 삭제
          </button>
        </div>

        {/* 항목 리스트 */}
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((it) => (
            <CarItem
              key={it.cartItemId}
              item={it}
              selected={!!selected[it.cartItemId]}
              onToggle={() => toggle(it.cartItemId)}
              onRemove={() => setPending({ ids: [it.cartItemId], all: false })}
            />
          ))}
        </ul>
      </section>

      {/* 우: 결제 예정 금액 */}
      <div className="w-full lg:w-[348px] lg:flex-shrink-0">
        <CartSummary
          selectedCount={selectedCount}
          totalAmount={selectedTotal}
          onCheckout={handleCheckout}
          onBrowse={() => router.push('/courses')}
        />
      </div>

      {/* 삭제 확인 모달 */}
      {pending && !processing && (
        <ConfirmModal
          title={
            pending.all
              ? '장바구니를 전체 삭제하시겠습니까?'
              : '선택한 강의를 삭제하시겠습니까?'
          }
          description={
            pending.all
              ? '담긴 강의가 모두 장바구니에서 삭제됩니다.'
              : `${pending.ids.length}개의 강의가 장바구니에서 삭제됩니다.`
          }
          cancelText="취소"
          confirmText="삭제"
          confirmVariant="danger"
          onCancel={() => setPending(null)}
          onConfirm={handleConfirmRemove}
        />
      )}

      {/* 삭제 처리중 */}
      {processing && (
        <LoadingModal title="삭제 중입니다" description="잠시만 기다려주세요..." />
      )}
    </div>
  );
}
