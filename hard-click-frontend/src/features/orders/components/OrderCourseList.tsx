'use client';

import type { OrderItem } from '../types';

const CheckIcon = (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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

/**
 * 주문 강의 목록 (client·선택 가능) — 단건 결제.
 * 행 클릭 시 선택 토글(선택 결제). 썸네일은 강의 이미지 자리(연동 시 next/image).
 */
export default function OrderCourseList({
  items,
  selected,
  onToggle,
}: {
  items: OrderItem[];
  selected: boolean[];
  onToggle: (index: number) => void;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => {
        const on = selected[i];
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={on}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                on
                  ? 'border-[#2F5DAA] bg-[#2F5DAA]/[0.04]'
                  : 'border-[#E5E9F0] bg-white hover:border-[#CBD5E1] hover:bg-[#FAFBFC]'
              }`}
            >
              {/* 체크박스 */}
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
                  on ? 'border-[#2F5DAA] bg-[#2F5DAA]' : 'border-[#CBD5E1] bg-white'
                }`}
              >
                {on && CheckIcon}
              </span>
              {/* 강의 이미지 자리 (썸네일) */}
              <span className="flex h-16 w-[88px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#EDF1F6] to-[#F8FAFC]">
                {ImageIcon}
              </span>
              {/* 강의 정보 */}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-[#0F172A]">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm text-[#64748B]">
                  {item.subtitle}
                </span>
              </span>
              {/* 가격 */}
              <span className="flex-shrink-0 text-lg font-bold text-[#2F5DAA]">
                {item.price.toLocaleString()}원
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
