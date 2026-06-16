/**
 * 결제 예정 금액 카드 (표시 전용 — 결제/둘러보기는 콜백으로 부모[CartClient] 처리).
 * 금액은 선택된 강의 기준. 결제하기 → 체크아웃, 강의 둘러보기 → 강의 목록.
 */
export default function CartSummary({
  selectedCount,
  totalAmount,
  onCheckout,
  onBrowse,
}: {
  selectedCount: number;
  totalAmount: number;
  onCheckout: () => void;
  onBrowse: () => void;
}) {
  const disabled = selectedCount === 0;

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      <h2 className="text-xl font-bold text-[#1F2937]">결제 예정 금액</h2>

      <div className="mt-7 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-[#4B5563]">선택한 강의</span>
          <span className="text-[15px] font-semibold text-[#1F2937]">
            {selectedCount}개
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-[#4B5563]">총 상품금액</span>
          <span className="text-[15px] font-semibold text-[#1F2937]">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      <div className="my-6 h-px bg-[#E2E8F0]" />

      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-[#1F2937]">
          최종 결제금액
        </span>
        <span className="text-[28px] font-extrabold leading-none tracking-tight text-[#2F5DAA]">
          {totalAmount.toLocaleString()}원
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={disabled}
        className={`mt-7 flex h-14 w-full items-center justify-center rounded-xl text-lg font-bold text-white transition ${
          disabled
            ? 'cursor-not-allowed bg-[#94A3B8]'
            : 'bg-[#2F5DAA] shadow-[0_8px_16px_-4px_rgba(47,93,170,0.4)] hover:bg-[#274C8B]'
        }`}
      >
        결제하기
      </button>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-3 h-12 w-full rounded-xl border border-[#E2E8F0] text-base font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
      >
        강의 둘러보기
      </button>
    </section>
  );
}
