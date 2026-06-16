import Link from 'next/link';

/** 찜한 강의가 없을 때 — 강의 둘러보기 유도 */
export default function WishlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white py-20 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/heartOutlineIcon.svg"
        width={56}
        height={56}
        alt=""
        className="opacity-40"
      />
      <p className="text-xl font-bold text-[#1F2937]">찜한 강의가 없습니다</p>
      <p className="text-sm text-[#4B5563]">
        관심 있는 강의의 하트를 눌러 찜해보세요
      </p>
      <Link
        href="/courses"
        className="mt-2 flex h-11 items-center rounded-[10px] bg-[#2F5DAA] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1D3E75]"
      >
        강의 둘러보기
      </Link>
    </div>
  );
}
