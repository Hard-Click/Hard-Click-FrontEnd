'use client';

import { useState, useMemo } from 'react';
import AdminReportFilterBar from './AdminReportFilterBar';
import AdminReportTable from './AdminReportTable';
import { mockReportList } from '@/mocks/reports.mock';
import { toReportItem } from '../types';
import type { ReportStatusFilter, ReportTargetFilter } from '../types';

const ALL_REPORTS = mockReportList.content.map(toReportItem);

export default function AdminReportManage() {
  const [status, setStatus] = useState<ReportStatusFilter>('ALL');
  const [target, setTarget] = useState<ReportTargetFilter>('ALL');

  const filtered = useMemo(() => {
    return ALL_REPORTS.filter((r) => {
      const matchStatus = status === 'ALL' || r.status === status;
      const matchTarget = target === 'ALL' || r.targetType === target;
      return matchStatus && matchTarget;
    });
  }, [status, target]);

  return (
    <div className="flex flex-col gap-6">
      <AdminReportFilterBar
        status={status}
        target={target}
        onStatusChange={setStatus}
        onTargetChange={setTarget}
      />
      <AdminReportTable reports={filtered} />
    </div>
  );
}
