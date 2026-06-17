'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { getNotifications, getUnreadCount } from '../services';
import {
  CATEGORY_ORDER,
  CATEGORY_LABEL,
  type NotificationCategory,
  type NotificationRole,
} from '../types';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  /** 역할 — mock에서 역할별 알림 목록을 고르기 위함 (STUDENT/INSTRUCTOR/ADMIN) */
  role: NotificationRole;
}

type FilterKey = 'all' | NotificationCategory;

/** 헤더 종 아이콘 + 알림 드롭다운 (학생/강사/관리자 공용) */
export default function NotificationDropdown({
  role,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const ref = useRef<HTMLDivElement>(null);

  // mock 동기 읽기 (useEffect 데이터 페칭 금지 — CLAUDE.md)
  const items = useMemo(() => getNotifications(role), [role]);
  const unreadCount = getUnreadCount(items);

  // 실제 존재하는 구분만 탭으로 노출한다 (없는 구분은 숨김)
  const categories = useMemo(() => {
    const present = new Set(items.map((n) => n.category));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [items]);

  const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: '전체' },
    ...categories.map((c) => ({ key: c, label: CATEGORY_LABEL[c] })),
  ];

  const visible =
    filter === 'all' ? items : items.filter((n) => n.category === filter);

  // 외부 클릭 시 닫기 (+ 필터 초기화)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilter('all');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const close = () => {
    setIsOpen(false);
    setFilter('all');
  };

  return (
    <div className="relative" ref={ref}>
      {/* 종 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0 ? `알림 (읽지 않음 ${unreadCount}개)` : '알림'
        }
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="relative w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-colors"
      >
        <Image src="/icons/bellIcon.svg" alt="" aria-hidden width={20} height={20} />
        {unreadCount > 0 && (
          <span className="absolute top-[-2px] left-[23px] min-w-[16px] h-4 bg-[#EF4444] rounded-full flex items-center justify-center px-[3px]">
            <span className="text-white font-bold text-[10px] leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-[380px] rounded-2xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden z-50">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
            <span className="text-base font-bold text-[#1F2937]">알림</span>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold text-[#2F5DAA]">
                읽지 않은 {unreadCount}개
              </span>
            )}
          </div>

          {/* 구분 탭 — 구분이 2개 이상일 때만 (필터) */}
          {categories.length > 1 && (
            <div className="flex gap-1.5 border-b border-[#F1F5F9] px-3 py-2.5">
              {tabs.map((t) => {
                const isActive = filter === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setFilter(t.key)}
                    className={`h-8 flex-1 whitespace-nowrap rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-[#2F5DAA] text-white'
                        : 'text-[#64748B] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 알림 목록 — 화면 높이만큼 아래로 쭉 늘어나고, 그보다 길면 그 안에서 스크롤
              (큰 화면: 스크롤 없이 전부 / 작은 화면: 맨 밑 알림까지 항상 닿음) */}
          {visible.length > 0 ? (
            <div className="max-h-[calc(100vh_-_190px)] divide-y divide-[#F1F5F9] overflow-y-auto">
              {visible.map((n) => (
                <NotificationItem key={n.notiId} item={n} onNavigate={close} />
              ))}
            </div>
          ) : (
            <p className="px-5 py-12 text-center text-sm text-[#9CA3AF]">
              {filter === 'all'
                ? '새로운 알림이 없습니다.'
                : '해당 구분의 알림이 없습니다.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
