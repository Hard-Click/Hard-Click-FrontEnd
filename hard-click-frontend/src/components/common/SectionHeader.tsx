import type { ReactNode } from 'react';

/** 섹션 제목 + 우측 액션(전체보기 등) 헤더 */
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-2xl font-bold text-[#1F2937] leading-8">{title}</h2>
      {action}
    </div>
  );
}
