import Link from 'next/link';

const CartIcon = (
  <svg aria-hidden="true" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

/** 빈 장바구니 — 안내 + 강의 둘러보기 진입 */
export default function CartEmptyState() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white py-20 text-center shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      <div className="flex justify-center">{CartIcon}</div>
      <h2 className="mt-6 text-2xl font-bold text-[#1F2937]">
        장바구니에 담긴 강의가 없습니다
      </h2>
      <p className="mt-2 text-[15px] text-[#4B5563]">
        관심 있는 강의를 장바구니에 담아보세요.
      </p>
      <Link
        href="/courses"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-[10px] bg-[#2F5DAA] px-7 text-base font-semibold text-white transition hover:bg-[#274C8B]"
      >
        강의 둘러보기
      </Link>
    </div>
  );
}
