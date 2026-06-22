'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { ReportItem, ReportTarget } from '../types';
import { getLatestReason } from '../types';
import AdminReportConfirmModal from './AdminReportConfirmModal';
import { useRouter } from 'next/navigation';

const TARGET_MOVE_LABEL: Record<ReportTarget, string> = {
  POST: '게시물로 이동',
  COMMENT: '댓글로 이동',
  REVIEW: '리뷰로 이동',
};

/** 처리 메모 최대 글자수 */
const MEMO_MAX_LENGTH = 50;

interface Props {
  report: ReportItem;
  onClose: () => void;
  onProcessReport: (report: ReportItem, memo?: string) => void;
  onSaveMemo: (report: ReportItem, memo: string) => void;
}

export default function AdminReportDetailModal({
  report,
  onClose,
  onProcessReport,
  onSaveMemo,
}: Props) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const [memo, setMemo] = useState(report.processMemo ?? '');
  // 이미 메모가 저장된 신고는 상세 단계를 건너뛰고 바로 처리 확인(2번)으로 진입한다.
  const [confirmOpen, setConfirmOpen] = useState(!!report.processMemo);

  const latestReason = getLatestReason(report);

  const handleSave = () => {
    onSaveMemo(report, memo);
    toast.success('처리 메모가 저장되었습니다.');
    onClose();
  };

  const router = useRouter();

  const handleNext = () => {
    setConfirmOpen(true);
  };

  const handleMove = () => {
    const reportKey = `${report.targetType}-${report.targetId}`;
    if (report.targetType === 'POST') {
      router.push(
        `/admin/community/${report.targetId}?from=report&reportKey=${reportKey}`
      );
      return;
    }
    if (report.targetType === 'COMMENT') {
      if (!report.postId) {
        toast.error('연결된 게시글 정보를 찾을 수 없습니다.');
        return;
      }
      router.push(
        `/admin/community/${report.postId}?from=report&reportKey=${reportKey}&highlightComment=${report.targetId}`
      );
      return;
    }
    if (report.targetType === 'REVIEW') {
      if (!report.courseId) {
        toast.error('연결된 강의 정보를 찾을 수 없습니다.');
        return;
      }
      router.push(
        `/admin/courses/manage/${report.courseId}?from=report&reportKey=${reportKey}&tab=reviews&highlightReview=${report.targetId}`
      );
      return;
    }
    toast.info(`${TARGET_MOVE_LABEL[report.targetType]} (준비 중)`);
  };

  if (confirmOpen) {
    return (
      <AdminReportConfirmModal
        report={report}
        memo={memo}
        onBack={() => setConfirmOpen(false)}
        onClose={onClose}
        onProcessReport={onProcessReport}
      />
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-detail-title"
        className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="report-detail-title"
            className="text-xl font-bold text-[#1F2937]"
          >
            신고 상세
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-[#94A3B8] transition-colors hover:text-[#1E293B]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 신고 대상 내용 */}
        <div className="mb-5 rounded-xl bg-[#FEF2F2] p-4">
          <p className="mb-1 text-xs font-semibold text-[#DC2626]">
            신고 대상 내용
          </p>
          <p className="text-sm text-[#1E293B]">{report.targetContent}</p>
        </div>

        {/* 신고 사유 + 누적 횟수 */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {/* 신고 사유 드롭다운 */}
          <div className="relative">
            <p className="mb-2 text-xs font-semibold text-[#64748B]">
              신고 사유
            </p>
            <button
              type="button"
              onClick={() => setReasonOpen((v) => !v)}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm font-medium text-[#1E293B]"
            >
              {latestReason}
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                className={`transition-transform ${
                  reasonOpen ? 'rotate-180' : ''
                }`}
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#64748B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {reasonOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
                {report.reasonStats.map((stat) => (
                  <div
                    key={stat.reason}
                    className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-2.5 text-sm last:border-none"
                  >
                    <span className="text-[#1E293B]">{stat.reason}</span>
                    <span className="font-semibold text-[#DC2626]">
                      {stat.count}회
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 누적 신고 횟수 */}
          <div>
            <p className="mb-2 text-xs font-semibold text-[#64748B]">
              누적 신고 횟수
            </p>
            <div className="flex h-11 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#DC2626]">
              {report.reportCount}회
            </div>
          </div>
        </div>

        {/* 악성 사용자 + 신고자 */}
        <div className="mb-5 grid grid-cols-2 gap-4">
          {/* 악성 사용자 (작성자) */}
          <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#DC2626]">
              <Image
                src="/icons/OrangePending.svg"
                alt=""
                width={12}
                height={12}
              />
              악성 사용자
            </p>
            <p className="text-sm font-bold text-[#1E293B]">
              {report.authorName}
            </p>
          </div>
          {/* 신고자 */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <p className="mb-1 text-xs font-semibold text-[#64748B]">신고자</p>
            <p className="text-sm font-bold text-[#1E293B]">
              {report.reporterName}
            </p>
          </div>
        </div>

        {/* 처리 메모 */}
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold text-[#374151]">
            처리 메모 (선택)
          </p>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value.slice(0, MEMO_MAX_LENGTH))}
            placeholder="처리 메모를 입력하세요"
            aria-label="처리 메모"
            rows={3}
            maxLength={MEMO_MAX_LENGTH}
            className="w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
          <p className="mt-1 text-right text-xs text-[#94A3B8]">
            {memo.length}/{MEMO_MAX_LENGTH}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleMove}
            className="h-10 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
          >
            {TARGET_MOVE_LABEL[report.targetType]}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#2F5DAA] hover:bg-[#F8FAFC]"
          >
            저장
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="h-10 flex-1 rounded-xl bg-[#2F5DAA] text-sm font-semibold text-white hover:bg-[#1D3E75]"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
