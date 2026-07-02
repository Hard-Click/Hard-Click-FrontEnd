'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ReportStatusBadge from './ReportStatusBadge';
import AdminReportDetailModal from './AdminReportDetailModal';
import type { ReportItem, ReportTarget } from '../types';
import AdminReportMemoModal from './AdminReportMemoModal';
import { fetchReportDetailAction } from '../actions';
import { useRouter } from 'next/navigation';

const TARGET_LABEL: Record<ReportTarget, string> = {
  POST: '게시글',
  COMMENT: '댓글',
  REVIEW: '리뷰',
};

const TARGET_STYLE: Record<ReportTarget, string> = {
  POST: 'bg-[#EFF6FF] text-[#2F5DAA]',
  COMMENT: 'bg-[#FEF3C7] text-[#D97706]',
  REVIEW: 'bg-[#F0FDF4] text-[#16A34A]',
};

interface Props {
  reports: ReportItem[];
  onProcessReport: (report: ReportItem, memo?: string) => void;
  openReportKey?: string;
  /** 게시물/리뷰 "신고 관리로 돌아가기" 복귀 → 해당 신고 상세 모달을 자동으로 다시 연다 */
  reopenModal?: boolean;
}

export default function AdminReportTable({
  reports,
  onProcessReport,
  openReportKey,
  reopenModal,
}: Props) {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [memoReport, setMemoReport] = useState<ReportItem | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const router = useRouter();

  const handleOpenDetail = async (report: ReportItem) => {
    setLoadingId(report.reportId);
    const enriched = await fetchReportDetailAction(report.reportId, report);
    setLoadingId(null);
    setSelectedReport(enriched);
  };

  // openReport 딥링크 진입 시 해당 신고 상세 모달 자동 오픈.
  // 대시보드 상세보기 = 하이라이트 + 모달 / 게시물 복귀(reopen=1) = 모달만.
  // setState는 fetch 완료 후(then)라 sync-setState-in-effect에 걸리지 않는다.
  const reopenedRef = useRef(false);
  useEffect(() => {
    if (!openReportKey || reopenedRef.current) return;
    const target = reports.find(
      (r) => `${r.targetType}-${r.targetId}` === openReportKey
    );
    if (!target) return;
    reopenedRef.current = true;
    void fetchReportDetailAction(target.reportId, target).then(
      setSelectedReport
    );
  }, [openReportKey, reports]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-[#374151]">
              대상 유형
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              대상 내용
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-[#374151]">
              작성자
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-[#374151]">
              신고 사유
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              신고 횟수
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              상태
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              신고일시
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="py-16 text-center text-sm text-[#94A3B8]"
              >
                해당하는 신고가 없습니다.
              </td>
            </tr>
          ) : (
            reports.map((report) => {
              const isPending = report.status === 'PENDING';
              // 복귀(reopen) 진입은 모달을 여는 흐름이라 하이라이트는 대시보드 딥링크에서만
              const isHighlighted =
                !reopenModal &&
                `${report.targetType}-${report.targetId}` === openReportKey;
              return (
                <tr
                  key={`${report.targetType}-${report.targetId}`}
                  className={
                    isHighlighted
                      ? '[&>td]:bg-[#FEF3C7] [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl'
                      : 'border-b border-[#E2E8F0] last:border-none hover:bg-[#F8FAFC]'
                  }
                >
                  {/* 대상 유형 */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        TARGET_STYLE[report.targetType]
                      }`}
                    >
                      {TARGET_LABEL[report.targetType]}
                    </span>
                  </td>
                  {/* 대상 내용 */}
                  <td className="px-6 py-4 text-center">
                    <p className="mx-auto max-w-[200px] truncate text-sm font-medium text-[#1E293B]">
                      {report.targetContent}
                    </p>
                  </td>
                  {/* 작성자 */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#64748B]">
                    {report.authorName}
                  </td>
                  {/* 신고 사유 (가장 최근 접수된 사유) */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#64748B]">
                    {report.reasonStats?.[0]?.reason ?? '-'}
                  </td>
                  {/* 신고 횟수 */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#EF4444]/10 px-3 py-1 text-xs font-semibold text-[#EF4444]">
                      <Image
                        src="/icons/RedFlag.svg"
                        alt="신고"
                        width={12}
                        height={12}
                      />
                      {report.reportCount}회
                    </span>
                  </td>
                  {/* 상태 */}
                  <td className="px-6 py-4 text-center">
                    <ReportStatusBadge status={report.status} />
                  </td>
                  {/* 신고일시 */}
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-[#64748B]">
                    {report.createdAt}
                  </td>
                  {/* 관리 */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          isPending
                            ? handleOpenDetail(report)
                            : setMemoReport(report)
                        }
                        disabled={loadingId === report.reportId}
                        className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-sm font-medium text-[#2F5DAA] hover:bg-[#F8FAFC] disabled:opacity-50"
                      >
                        <Image
                          src={
                            isPending
                              ? '/icons/openEye.svg'
                              : '/icons/editIcon.svg'
                          }
                          alt=""
                          width={16}
                          height={16}
                        />
                        {loadingId === report.reportId ? '로딩 중...' : isPending ? '상세보기' : '메모보기'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {selectedReport && (
        <AdminReportDetailModal
          report={selectedReport}
          onClose={() => {
            setSelectedReport(null);
            if (openReportKey) router.replace('/admin/reports');
          }}
          onProcessReport={onProcessReport}
        />
      )}

      {memoReport && (
        <AdminReportMemoModal
          memo={memoReport.processMemo}
          onClose={() => setMemoReport(null)}
        />
      )}
    </div>
  );
}
