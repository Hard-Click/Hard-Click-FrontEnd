'use client';

import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectDropdownProps {
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** 부모 너비를 꽉 채우고 화살표를 오른쪽 끝으로 (기본: 옵션 길이에 맞춘 자동 너비) */
  fullWidth?: boolean;
  /** 루트 컨테이너 추가 클래스 (예: 'w-[499px]') */
  className?: string;
  /** 비활성 — 열기/선택 불가 (값 표시만) */
  disabled?: boolean;
  /** 버튼 추가 클래스 (예: 'h-14') */
  buttonClassName?: string;
}

/**
 * 공용 커스텀 셀렉트 드롭다운 (네이티브 select 대체).
 * 토글 버튼 + 외부클릭 닫기 + 옵션 리스트 + 선택 하이라이트.
 * InstructorCourseFilterBar 인라인 구현을 추출 → 강사 강의 필터·퀴즈 주차 필터 등에서 재사용.
 */
export default function SelectDropdown({
  placeholder,
  value,
  options,
  onChange,
  fullWidth = false,
  className,
  disabled = false,
  buttonClassName,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayText = value
    ? (options.find((o) => o.value === value)?.label ?? placeholder)
    : placeholder;

  // 가장 긴 옵션으로 버튼 최소 너비 고정 (선택 변경 시 너비 점프 방지)
  // label이 undefined인 옵션(BE 미제공 값 등)이 섞여도 안 터지게 방어 — 공용 프리미티브.
  const longestLabel = options.reduce(
    (max, opt) => ((opt.label ?? '').length > max.length ? opt.label : max),
    placeholder,
  );

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={`relative flex h-10 items-center whitespace-nowrap border border-[#E2E8F0] pl-6 pr-3 text-base transition-colors ${buttonClassName ?? ''} ${
          disabled
            ? 'cursor-not-allowed bg-[#F1F5F9]'
            : 'bg-white hover:border-[#CBD5E1]'
        } ${fullWidth ? 'w-full justify-between' : 'gap-1.5'} ${
          isOpen && !disabled ? 'rounded-t-2xl' : 'rounded-2xl'
        }`}
      >
        <span className="invisible select-none" aria-hidden>
          {longestLabel}
        </span>
        <span
          className={`absolute left-6 whitespace-nowrap ${
            value ? 'text-[#1F2937]' : 'text-[rgba(26,31,46,0.5)]'
          }`}
        >
          {displayText}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="rgba(26,31,46,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 top-full z-50 max-h-72 min-w-full overflow-y-auto rounded-b-2xl border border-t-0 border-[#E2E8F0] bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full border-b border-[#E2E8F0] px-6 py-2 text-left text-base transition-colors last:border-b-0 ${
                value === opt.value
                  ? 'bg-[rgba(47,93,170,0.05)] font-bold text-[#2F5DAA]'
                  : 'font-medium text-[#1F2937] hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
