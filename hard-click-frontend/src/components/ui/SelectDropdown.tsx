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

  // disabled로 바뀌면 열림 상태 즉시 정리 — 열린 채 비활성→재활성 시 메뉴가 갑자기 뜨는 것 방지
  if (disabled && isOpen) setIsOpen(false);

  const displayText = value
    ? (options.find((o) => o.value === value)?.label ?? placeholder)
    : placeholder;

  // 가장 긴 옵션으로 버튼 최소 너비 고정 (선택 변경 시 너비 점프 방지)
  const longestLabel = options.reduce(
    (max, opt) => (opt.label.length > max.length ? opt.label : max),
    placeholder,
  );

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={`relative flex h-10 items-center whitespace-nowrap rounded-2xl border border-[#E2E8F0] pl-4 pr-3 text-base transition-colors ${
          disabled
            ? 'cursor-not-allowed bg-[#F1F5F9]'
            : 'bg-white hover:border-[#CBD5E1]'
        } ${fullWidth ? 'w-full justify-between' : 'gap-1.5'}`}
      >
        <span className="invisible select-none" aria-hidden>
          {longestLabel}
        </span>
        <span className="absolute left-4 whitespace-nowrap text-[rgba(26,31,46,0.5)]">
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
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-52 min-w-full overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white py-2 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-5 py-2.5 text-left text-base transition-colors hover:bg-gray-50 ${
                value === opt.value
                  ? 'font-semibold text-[#2F5DAA]'
                  : 'text-[rgba(26,31,46,0.8)]'
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
