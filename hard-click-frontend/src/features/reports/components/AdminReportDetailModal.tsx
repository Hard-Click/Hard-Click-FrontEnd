'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { ReportItem, ReportTarget } from '../types';

const TARGET_MOVE_LABEL: Record<ReportTarget, string> = {
  POST: '게시물로 이동',
  COMMENT: '댓글로 이동',
  REVIEW: '리뷰로 이동',
};

const TARGET_DELETE_LABEL: Record<ReportTarget, string> = {
  POST: '게시물 삭제',
  COMMENT: '댓글 삭제',
  REVIEW: '리뷰 삭제',
};

interface Props {
  report: ReportItem;
  onClose: () => void;
}

export default function AdminReportDetailModal({ report, onClose }: Props) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const [memo, setMemo] = useState('');
  const [deleteContent, setDeleteContent] = useState(false);

  const latestReason = report.reasonStats[0]?.reason ?? '-';

  const handleConfirm = () => {
    // TODO: 신고 처리 API 연동 (mock)
    toast.success('신고가 처리되었습니다.');
    onClose();
  };

  const handleMove = () => {
    // TODO: 대상 유형별 이동 경로 연동
    toast.info(`${TARGET_MOVE_LABEL[report.targetType]} (준비 중)`);
  };

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
        <h2
          id="report-detail-title"
          className="mb-6 text-xl font-bold text-[#1F2937]"
        >
          신고 상세
        </h2>

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
            onChange={(e) => setMemo(e.target.value)}
            placeholder="처리 메모를 입력하세요"
            aria-label="처리 메모"
            rows={3}
            className="w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* 콘텐츠 삭제 체크박스 */}
        <label className="mb-6 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={deleteContent}
            onChange={(e) => setDeleteContent(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-[#B91C1C] accent-[#B91C1C]"
          />
          <span className="text-m font-bold text-[#B91C1C]">
            {TARGET_DELETE_LABEL[report.targetType]}
          </span>
        </label>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleMove}
            className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
          >
            {TARGET_MOVE_LABEL[report.targetType]}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-12 flex-1 rounded-xl bg-[#2F5DAA] text-sm font-semibold text-white hover:bg-[#1D3E75]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
