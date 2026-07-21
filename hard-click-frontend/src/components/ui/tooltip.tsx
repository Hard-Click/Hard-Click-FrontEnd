'use client';

import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

/**
 * 공용 hover 툴팁 (네이티브 title 대체).
 * title 속성은 브라우저 기본 hover 딜레이(1~1.5초)가 있어 커스터마이즈 불가 —
 * 이 컴포넌트는 hover 시 즉시 표시된다.
 */
export default function Tooltip({ content, children, className = '' }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      {isOpen && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1F2937CC] px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          {content}
        </span>
      )}
    </span>
  );
}
