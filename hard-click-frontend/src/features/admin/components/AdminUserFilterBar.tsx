'use client';

import Image from 'next/image';
import type {
  AdminUserRoleFilter,
  AdminUserStatusFilter,
} from '@/features/admin/types';

const ROLE_OPTIONS: { key: AdminUserRoleFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'STUDENT', label: '수강생' },
  { key: 'INSTRUCTOR', label: '강사' },
];

const STATUS_OPTIONS: { key: AdminUserStatusFilter; label: string }[] = [
  { key: 'ALL', label: '전체 상태' },
  { key: 'ACTIVE', label: '활성' },
  { key: 'SUSPENDED', label: '이용제한' },
  { key: 'WITHDRAWN', label: '탈퇴' },
];

interface AdminUserFilterBarProps {
  role: AdminUserRoleFilter;
  status: AdminUserStatusFilter;
  keyword: string;
  onRoleChange: (role: AdminUserRoleFilter) => void;
  onStatusChange: (status: AdminUserStatusFilter) => void;
  onKeywordChange: (keyword: string) => void;
}

function tabClass(isActive: boolean): string {
  return `h-9 whitespace-nowrap rounded-[30px] px-4 text-sm font-semibold transition ${
    isActive
      ? 'bg-[#2F5DAA] text-white'
      : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
  }`;
}

export default function AdminUserFilterBar({
  role,
  status,
  keyword,
  onRoleChange,
  onStatusChange,
  onKeywordChange,
}: AdminUserFilterBarProps) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      {/* 1행: 역할 탭 + 검색 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onRoleChange(option.key)}
              className={tabClass(role === option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] px-4">
          <Image src="/icons/search.svg" alt="검색" width={18} height={18} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="이름, 아이디 또는 이메일로 검색"
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      {/* 2행: 계정 상태 탭 */}
      <div className="mt-4 flex items-center gap-3">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onStatusChange(option.key)}
            className={tabClass(status === option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
