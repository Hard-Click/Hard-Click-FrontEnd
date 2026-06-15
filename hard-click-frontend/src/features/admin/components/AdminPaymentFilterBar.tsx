'use client';

import Image from 'next/image';
import type { AdminPaymentTypeFilter } from '@/features/payment/types';

const TYPE_OPTIONS: { key: AdminPaymentTypeFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'COURSE', label: '강의 결제' },
  { key: 'SUBSCRIPTION', label: '구독 결제' },
];

interface AdminPaymentFilterBarProps {
  type: AdminPaymentTypeFilter;
  keyword: string;
  onTypeChange: (type: AdminPaymentTypeFilter) => void;
  onKeywordChange: (keyword: string) => void;
}

export default function AdminPaymentFilterBar({
  type,
  keyword,
  onTypeChange,
  onKeywordChange,
}: AdminPaymentFilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* 구분 탭 (세그먼트) */}
      <div className="flex gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-sm">
        {TYPE_OPTIONS.map((option) => {
          const isActive = type === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onTypeChange(option.key)}
              className={`h-12 flex-1 whitespace-nowrap rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#2F5DAA] text-white'
                  : 'text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* 검색 */}
      <div className="flex h-12 items-center rounded-2xl border border-[#E2E8F0] bg-white px-4 shadow-sm">
        <Image src="/icons/search.svg" alt="검색" width={18} height={18} />
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="주문번호, 사용자명, 이메일 검색"
          aria-label="결제 내역 검색 (주문번호, 사용자명, 이메일)"
          className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
        />
      </div>
    </div>
  );
}
