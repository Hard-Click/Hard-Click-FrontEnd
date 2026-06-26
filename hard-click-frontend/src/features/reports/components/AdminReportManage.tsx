'use client';

import { useState, useMemo } from 'react';
import AdminReportFilterBar from './AdminReportFilterBar';
import AdminReportTable from './AdminReportTable';
import Pagination from '@/features/admin/components/Pagination';
import type {
  ReportItem,
  ReportStatusFilter,
  ReportTargetFilter,
} from '../types';

const PAGE_SIZE = 10;

export default function AdminReportManage({
  initialReports,
  openReport,
}: {
  initialReports: ReportItem[];
  openReport?: string;
}) {
  // 목록 원본 state (처리의 source of truth)
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [status, setStatus] = useState<ReportStatusFilter>('ALL');
  const [target, setTarget] = useState<ReportTargetFilter>('ALL');

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        const matchStatus = status === 'ALL' || r.status === status;
        const matchTarget = target === 'ALL' || r.targetType === target;
        return matchStatus && matchTarget;
      }),
    [reports, status, target]
  );

  // 딥링크(openReport)로 진입 시 해당 신고가 있는 페이지로 시작
  const [page, setPage] = useState(() => {
    if (!openReport) return 1;
    const idx = filtered.findIndex(
      (r) => `${r.targetType}-${r.targetId}` === openReport
    );
    return idx >= 0 ? Math.floor(idx / PAGE_SIZE) + 1 : 1;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedReports = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // 필터 변경 시 1페이지로 리셋
  const handleStatusChange = (next: ReportStatusFilter) => {
    setStatus(next);
    setPage(1);
  };
  const handleTargetChange = (next: ReportTargetFilter) => {
    setTarget(next);
    setPage(1);
  };

  // 신고 처리: 행을 제거하지 않고 그대로 두되, 대상(게시물/댓글/대댓글)은
  // 삭제 처리하고 상태를 '처리 완료'로 바꾼다. (입력한 메모가 있으면 함께 보존)
  const handleProcessReport = (report: ReportItem, memo?: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.targetType === report.targetType && r.targetId === report.targetId
          ? {
              ...r,
              status: 'RESOLVED',
              isTargetDeleted: true,
              processMemo: memo ?? r.processMemo,
            }
          : r
      )
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminReportFilterBar
        status={status}
        target={target}
        onStatusChange={handleStatusChange}
        onTargetChange={handleTargetChange}
      />
      <AdminReportTable
        reports={pagedReports}
        onProcessReport={handleProcessReport}
        openReportKey={openReport}
      />
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
