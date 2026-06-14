'use client';

import { useState } from 'react';
import AdminReportFilterBar from './AdminReportFilterBar';
import type { ReportStatusFilter, ReportTargetFilter } from '../types';

export default function AdminReportManage() {
  const [status, setStatus] = useState<ReportStatusFilter>('ALL');
  const [target, setTarget] = useState<ReportTargetFilter>('ALL');

  return (
    <div className="flex flex-col gap-6">
      <AdminReportFilterBar
        status={status}
        target={target}
        onStatusChange={setStatus}
        onTargetChange={setTarget}
      />
      {/* 신고 목록 테이블 (다음 이슈에서 추가) */}
    </div>
  );
}
