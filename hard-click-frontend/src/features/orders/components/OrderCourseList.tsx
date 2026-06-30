'use client';

import type { OrderItem } from '../types';

const CheckIcon = (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
// 강의 썸네일 대신 쓰는 학사모(졸업모) 아이콘 — 흰색, 파란 박스 위에 표시
const GradCapIcon = (
  <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0 0-1.844L12.83 5.18a2 2 0 0 0-1.66 0L2.58 9.078a1 1 0 0 0 0 1.844l8.59 3.898a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

/**
 * 주문 강의 목록 (client·선택 가능) — 단건 결제.
 * 행 클릭 시 선택 토글(선택 결제). 썸네일은 강의 이미지를 받지 않고 학사모 파란 박스로 표시.
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
              {/* 강의 썸네일 대신 학사모 파란 박스 (이미지 미사용 — 구독 상품 박스와 동일 스타일) */}
              <span className="flex h-16 w-[88px] flex-shrink-0 items-center justify-center rounded-xl bg-[#2F5DAA]">
                {GradCapIcon}
              </span>
              {/* 강의 정보 */}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-[#0F172A]">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="mt-1 block text-sm text-[#64748B]">
                    {item.subtitle}
                  </span>
                )}
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
