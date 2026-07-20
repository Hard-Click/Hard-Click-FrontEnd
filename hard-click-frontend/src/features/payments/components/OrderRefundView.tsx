'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { refundAction } from '../actions';
import type { OrderDetail, OrderDetailItem } from '../types';

const CheckIcon = (
  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const ImageIcon = (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A4AFBE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
  </svg>
);
// 구독 상품 썸네일 — 체크아웃과 동일한 파란 박스 + sparkle
const SparkleIcon = (
  <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
  </svg>
);

const cardClass =
  'mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-[0_4px_10px_rgba(0,0,0,0.06)]';

/**
 * 주문 내역 + 환불 안내 (client) — 선택 상태 공유.
 * 항목은 사유 인라인 없이 표시. 환불된 항목은 "환불 완료" + 체크박스 없음.
 * 환불 불가 항목도 일반 체크박스(표시 없음) → [환불 요청하기] 시 "환불 불가" 모달로 안내.
 */
export default function OrderRefundView({ order }: { order: OrderDetail }) {
  const isSubscription = order.paymentType === 'SUBSCRIPTION';
  // 구독 환불액이 실제 비례식(BE 제공)인지, BE가 item 미제공 시의 폴백 전액 추정인지.
  //   추정이면 '오늘 기준 일할' 단정 금지 — 전액을 일할 환불액처럼 오표시하지 않게(§0.1②).
  const refundEstimated =
    isSubscription &&
    order.items.some((it) => it.isSubscription && it.refundAmountEstimated);
  const [refundedIds, setRefundedIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<boolean[]>(() =>
    order.items.map(() => true),
  );
  const [modal, setModal] = useState<'none' | 'request' | 'blocked'>('none');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isRefunded = (it: OrderDetailItem) =>
    order.status === 'REFUNDED' ||
    it.refunded === true || // BE 부분환불 항목
    refundedIds.includes(it.courseId);
  const selectable = order.status === 'PAID';
  // 빈 items(구독 주문은 BE가 item 안 줌)에서 every()가 무조건 true → "환불 완료" 오표시 방지
  const allRefunded = order.items.length > 0 && order.items.every(isRefunded);

  // 선택 = 체크 && 미환불
  const isSel = (i: number) => selected[i] && !isRefunded(order.items[i]);
  const selectedTotal = order.items.reduce(
    (sum, it, i) => sum + (isSel(i) ? it.refundAmount : 0),
    0,
  );
  const selectedCount = order.items.filter((_, i) => isSel(i)).length;
  const refundableSelected = order.items.filter(
    (it, i) => isSel(i) && it.refundable,
  );
  const blockedSelected = order.items.filter(
    (it, i) => isSel(i) && !it.refundable,
  );

  const toggle = (i: number) =>
    setSelected((prev) => prev.map((v, j) => (j === i ? !v : v)));

  const handleRequestClick = () => {
    if (selectedCount === 0) return;
    if (blockedSelected.length > 0) {
      setModal('blocked'); // 환불 불가 항목이 선택됨 → 안내
      return;
    }
    setReason('');
    setReasonError(false);
    setModal('request');
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    setProcessing(true);
    const courseIds = refundableSelected.map((it) => it.courseId);
    try {
      const res = await refundAction(
        order.orderId,
        courseIds,
        reason,
        isSubscription,
      );
      if (res.ok) {
        toast.success(
          isSubscription ? '구독 환불이 완료되었습니다' : '환불이 완료되었습니다',
        );
        setModal('none');
        setRefundedIds((prev) => [...prev, ...courseIds]);
      } else if (res.kind === 'blocked') {
        setModal('blocked');
      } else {
        toast.error('환불 요청에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      toast.error('환불 요청에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* 주문 내역 (미환불 항목에 체크박스, 환불된 항목은 "환불 완료") */}
      <section className={cardClass}>
        <h2 className="text-lg font-bold text-[#1F2937]">주문 내역</h2>
        <ul className="mt-3 flex flex-col">
          {order.items.map((it, i) => {
            const refunded = isRefunded(it);
            return (
              <li
                key={it.courseId}
                className={`flex items-center gap-4 py-4 ${
                  i > 0 ? 'border-t border-[#E2E8F0]' : ''
                } ${refunded ? 'opacity-60' : ''}`}
              >
                {selectable && !refunded && (
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-pressed={selected[i]}
                    aria-label={`${it.title} 환불 선택`}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[5px] border-2 transition ${
                      selected[i]
                        ? 'border-[#2F5DAA] bg-[#2F5DAA]'
                        : 'border-[#CBD5E1] bg-white'
                    }`}
                  >
                    {selected[i] && CheckIcon}
                  </button>
                )}
                {/* 썸네일 — 구독=sparkle 박스 / 강의=thumbnailUrl 있으면 next/image(BE 제공), 없으면 그라데이션 placeholder.
                    코드베이스 썸네일 패턴(CourseCard·WishlistCard)과 일관 — next/image 전환 완료 */}
                {it.isSubscription ? (
                  <span className="flex h-16 w-[88px] flex-shrink-0 items-center justify-center rounded-xl bg-[#2F5DAA]">
                    {SparkleIcon}
                  </span>
                ) : it.thumbnailUrl ? (
                  <Image
                    src={it.thumbnailUrl}
                    alt={it.title}
                    width={88}
                    height={64}
                    className="h-16 w-[88px] flex-shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-[88px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#EDF1F6] to-[#F8FAFC]">
                    {ImageIcon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#1F2937]">
                    {it.title}
                  </p>
                  {it.instructor && (
                    <p className="mt-0.5 text-sm text-[#64748B]">
                      {it.instructor}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {it.isSubscription && (
                      <span className="rounded-md bg-[#2F5DAA]/10 px-2 py-0.5 text-xs font-semibold text-[#2F5DAA]">
                        구독 상품
                      </span>
                    )}
                    {refunded ? (
                      <span className="rounded-md bg-[#4B5563]/10 px-2 py-0.5 text-xs font-semibold text-[#4B5563]">
                        환불 완료
                      </span>
                    ) : (
                      it.enrollStatus &&
                      it.enrollStatus !== '-' && (
                        <span className="rounded-md bg-[#16A34A]/10 px-2 py-0.5 text-xs font-semibold text-[#16A34A]">
                          {it.enrollStatus}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <p className="flex-shrink-0 font-bold text-[#1F2937]">
                  {it.price.toLocaleString()}원
                </p>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-5">
          <span className="font-bold text-[#1F2937]">총 결제금액</span>
          <span className="text-xl font-bold text-[#2F5DAA]">
            {order.totalAmount.toLocaleString()}원
          </span>
        </div>
      </section>

      {/* 환불 영역 (상태별) — 결제 실패는 환불 대상이 없어 영역 자체를 표시하지 않음 */}
      {order.status === 'FAILED' ? null : allRefunded ? (
        <section className={cardClass}>
          <h2 className="text-lg font-bold text-[#1F2937]">환불 완료</h2>
          <div className="mt-4 rounded-xl bg-[#F8FAFC] p-5">
            <p className="text-[15px] leading-relaxed text-[#475569]">
              환불이 완료되었습니다. 환불 금액은 2-3 영업일 내에 결제 수단으로
              반환됩니다.
            </p>
            <div className="mt-4 border-t border-[#E2E8F0] pt-4">
              <p className="text-sm font-bold text-[#B91C1C]">
                강의 접근 제한 안내
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[#475569]">
                <li>• 환불된 강의는 더 이상 수강하실 수 없습니다</li>
                <li>• 구독 환불의 경우, 금일까지 이용 가능합니다</li>
                <li>• 학습 진도 및 수강 기록은 삭제됩니다</li>
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <section className={cardClass}>
          <h2 className="text-lg font-bold text-[#1F2937]">환불 안내</h2>
          <div className="mt-4 rounded-xl bg-[#F8FAFC] p-5">
            <p className="text-sm text-[#475569]">
              <span className="font-semibold text-[#16A34A]">환불 가능 조건:</span>{' '}
              {order.refundConditionNote}
            </p>
            <p className="mt-4 text-sm font-semibold text-[#16A34A]">
              환불 가능 항목:
            </p>
            <ul className="mt-2 space-y-1">
              {refundableSelected.length === 0 ? (
                <li className="text-sm text-[#94A3B8]">
                  환불 가능한 항목이 없습니다.
                </li>
              ) : (
                refundableSelected.map((it) => (
                  <li key={it.courseId} className="text-sm text-[#475569]">
                    • {it.title}
                    {it.refundNote && (
                      <span className="text-[#94A3B8]"> ({it.refundNote})</span>
                    )}
                  </li>
                ))
              )}
            </ul>
            <p className="mt-4 text-sm font-bold text-[#2F5DAA]">
              예상 환불 금액{isSubscription && !refundEstimated ? ' (오늘 기준)' : ''}:{' '}
              {selectedTotal.toLocaleString()}원
            </p>
            {isSubscription && (
              <p className="mt-1 text-xs text-[#94A3B8]">
                {refundEstimated
                  ? '표시 금액은 결제 원금 기준이며, 실제 환불액은 남은 기간에 따라 이보다 적을 수 있어요.'
                  : '구독은 남은 기간에 따라 일할 계산되어 매일 환불액이 달라져요.'}
              </p>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleRequestClick}
              disabled={selectedCount === 0}
              className={`h-11 rounded-xl px-6 text-sm font-bold text-white transition ${
                selectedCount === 0
                  ? 'cursor-not-allowed bg-[#94A3B8]'
                  : 'bg-[#DC2626] hover:bg-[#B91C1C]'
              }`}
            >
              환불 요청하기
            </button>
          </div>
        </section>
      )}

      {/* 환불 요청 모달 */}
      {modal === 'request' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-[0_20px_48px_-12px_rgba(16,24,40,0.4)]">
            <h3 className="text-center text-xl font-bold text-[#0F172A]">
              환불 요청
            </h3>

            <p className="mt-5 text-sm font-semibold text-[#475569]">환불 항목</p>
            <div className="mt-2 rounded-xl bg-[#F8FAFC] p-4">
              {refundableSelected.map((it) => (
                <div
                  key={it.courseId}
                  className="flex items-center justify-between py-1 text-sm text-[#475569]"
                >
                  <span className="min-w-0 truncate">{it.title}</span>
                  {/* BE가 비례 환불액을 안 줘 결제 원금으로 합성한 값이면 확정 금액처럼 보이면 안 된다(§0.1②) */}
                  <span className="flex-shrink-0 font-medium text-[#2F5DAA]">
                    {it.refundAmount.toLocaleString()}원
                    {it.refundAmountEstimated && (
                      <span className="ml-1 text-xs font-normal text-[#94A3B8]">
                        (예상)
                      </span>
                    )}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                <span className="font-bold text-[#1F2937]">총 환불 금액</span>
                <span className="text-lg font-bold text-[#2F5DAA]">
                  {selectedTotal.toLocaleString()}원
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm font-semibold text-[#475569]">환불 사유</p>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError && e.target.value.trim()) setReasonError(false);
              }}
              placeholder="환불 사유를 입력해주세요."
              rows={4}
              className={`mt-2 w-full resize-none rounded-xl border bg-white p-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2F5DAA] ${
                reasonError ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
              }`}
            />
            {reasonError && (
              <p className="mt-1 text-xs text-[#DC2626]">환불 사유를 입력해주세요</p>
            )}

            <div className="mt-4 rounded-xl bg-[#FEF2F2] p-4">
              <p className="text-sm font-semibold text-[#B91C1C]">환불 처리 안내</p>
              <ul className="mt-1.5 space-y-1 text-xs text-[#7F1D1D]">
                <li>• 환불 요청 후 2-3 영업일 내에 처리됩니다</li>
                <li>• 환불이 완료되면 강의 접근 권한이 제거됩니다</li>
                <li>
                  {refundEstimated
                    ? '• 구독 상품은 남은 기간 비례 환불되며, 실제 환불액은 표시 금액보다 적을 수 있습니다'
                    : '• 구독 상품은 남은 기간 비례 환불됩니다'}
                </li>
              </ul>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setModal('none')}
                className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-base font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={processing}
                className="h-12 flex-1 rounded-xl bg-[#DC2626] text-base font-bold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
              >
                {processing
                  ? '처리 중...'
                  : `${selectedTotal.toLocaleString()}원 환불 요청`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 환불 불가 모달 — 상세 사유 없이 간단 안내 */}
      {modal === 'blocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-7 text-center shadow-[0_20px_48px_-12px_rgba(16,24,40,0.4)]">
            <h3 className="text-xl font-bold text-[#1F2937]">환불 불가</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#64748B]">
              환불 조건을 충족하지 않아 환불할 수 없어요.
            </p>
            <button
              type="button"
              onClick={() => setModal('none')}
              className="mt-6 h-12 w-full rounded-xl bg-[#2F5DAA] text-base font-bold text-white transition hover:bg-[#274C8B]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
