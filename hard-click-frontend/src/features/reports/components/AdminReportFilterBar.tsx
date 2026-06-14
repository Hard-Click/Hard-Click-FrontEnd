'use client';

import ReportFilterTabGroup from './ReportFilterTabGroup';
import type { ReportStatusFilter, ReportTargetFilter } from '../types';

const STATUS_OPTIONS: { key: ReportStatusFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'PENDING', label: '처리 대기' },
  { key: 'RESOLVED', label: '처리 완료' },
  { key: 'REJECTED', label: '반려' },
];

const TARGET_OPTIONS: { key: ReportTargetFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'POST', label: '게시글' },
  { key: 'COMMENT', label: '댓글' },
  { key: 'REVIEW', label: '리뷰' },
];

interface AdminReportFilterBarProps {
  status: ReportStatusFilter;
  target: ReportTargetFilter;
  onStatusChange: (status: ReportStatusFilter) => void;
  onTargetChange: (target: ReportTargetFilter) => void;
}

export default function AdminReportFilterBar({
  status,
  target,
  onStatusChange,
  onTargetChange,
}: AdminReportFilterBarProps) {
  return (
    <div className="flex items-center gap-8 rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 shadow-sm">
      <ReportFilterTabGroup
        title="처리 상태"
        options={STATUS_OPTIONS}
        value={status}
        onChange={onStatusChange}
      />
      <ReportFilterTabGroup
        title="신고 대상"
        options={TARGET_OPTIONS}
        value={target}
        onChange={onTargetChange}
      />
    </div>
  );
}
