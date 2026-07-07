'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/features/notifications/NotificationProvider';
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
  reopen,
}: {
  initialReports: ReportItem[];
  openReport?: string;
  /** 게시물/리뷰의 "신고 관리로 돌아가기" 복귀(reopen=1) → 상세 모달 자동 오픈 */
  reopen?: boolean;
}) {
  const router = useRouter();
  const { notifications } = useNotifications();

  // 목록 원본 state (처리의 source of truth)
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [status, setStatus] = useState<ReportStatusFilter>('ALL');
  const [target, setTarget] = useState<ReportTargetFilter>('ALL');

  // 서버가 새 목록을 내려주면(router.refresh 등) 동기화 — NotificationProvider와 동일 패턴.
  // (props로 파생된 state를 prop 변경 시 갱신 — effect 아닌 렌더 중 처리)
  const [seed, setSeed] = useState(initialReports);
  if (seed !== initialReports) {
    setSeed(initialReports);
    setReports(initialReports);
  }

  // 새 신고 알림(SSE)이 오면 목록을 재조회한다. NotificationProvider는 종(bell) 데이터만
  // 갱신하고 이 테이블의 reports state는 건드리지 않으므로, REPORT 알림의 최댓값 id가
  // 커지면 router.refresh()로 이 페이지(Server Component)를 다시 조회해 위 seed로 반영한다.
  // (BE 목록이 항상 최신순이라는 보장이 없어 첫 항목만 보는 find()는 순서에 취약 — max로 비교)
  const latestReportNotiId = useRef<number | null>(null);
  useEffect(() => {
    const reportNotiIds = notifications
      .filter((n) => n.type === 'REPORT')
      .map((n) => n.notiId);
    if (reportNotiIds.length === 0) return;
    const maxId = Math.max(...reportNotiIds);
    if (latestReportNotiId.current === null) {
      latestReportNotiId.current = maxId; // 최초 마운트 — 기준값만 저장, 새로고침 X
      return;
    }
    if (maxId > latestReportNotiId.current) {
      latestReportNotiId.current = maxId;
      router.refresh();
    }
  }, [notifications, router]);

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        const matchStatus = status === 'ALL' || r.status === status;
        const matchTarget = target === 'ALL' || r.targetType === target;
        return matchStatus && matchTarget;
      }),
    [reports, status, target]
  );

  // 딥링크 키 정규화: 원 형식은 `${targetType}-${targetId}`지만, 대시보드(라이브)는
  // BE 응답에 targetId가 없어 `${targetType}-${reportId}`로 온다 → reportId로 행을
  // 찾아 canonical 키(targetType-targetId)로 변환해 하이라이트가 매칭되게 한다.
  const resolvedOpenReport = useMemo(() => {
    if (!openReport) return undefined;
    if (reports.some((r) => `${r.targetType}-${r.targetId}` === openReport)) {
      return openReport;
    }
    const byReportId = reports.find(
      (r) => `${r.targetType}-${r.reportId}` === openReport
    );
    return byReportId
      ? `${byReportId.targetType}-${byReportId.targetId}`
      : openReport;
  }, [openReport, reports]);

  // 딥링크(openReport)로 진입 시 해당 신고가 있는 페이지로 시작
  const [page, setPage] = useState(() => {
    if (!resolvedOpenReport) return 1;
    const idx = filtered.findIndex(
      (r) => `${r.targetType}-${r.targetId}` === resolvedOpenReport
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
        openReportKey={resolvedOpenReport}
        reopenModal={reopen}
      />
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
