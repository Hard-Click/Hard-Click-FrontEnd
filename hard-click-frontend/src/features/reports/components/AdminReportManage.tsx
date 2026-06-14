'use client';

import { useState, useMemo } from 'react';
import AdminReportFilterBar from './AdminReportFilterBar';
import AdminReportTable from './AdminReportTable';
import { mockReportList } from '@/mocks/reports.mock';
import { toReportItem } from '../types';
import type {
  ReportItem,
  ReportStatusFilter,
  ReportTargetFilter,
} from '../types';

export default function AdminReportManage({
  openReport,
}: {
  openReport?: string;
}) {
  // 목록 원본 state (삭제/처리의 source of truth)
  const [reports, setReports] = useState<ReportItem[]>(() =>
    mockReportList.content.map(toReportItem)
  );
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

  const handleRemoveReport = (report: ReportItem) => {
    setReports((prev) =>
      prev.filter(
        (r) =>
          !(
            r.targetType === report.targetType && r.targetId === report.targetId
          )
      )
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminReportFilterBar
        status={status}
        target={target}
        onStatusChange={setStatus}
        onTargetChange={setTarget}
      />
      <AdminReportTable
        reports={filtered}
        onRemoveReport={handleRemoveReport}
        openReportKey={openReport}
      />
    </div>
  );
}
