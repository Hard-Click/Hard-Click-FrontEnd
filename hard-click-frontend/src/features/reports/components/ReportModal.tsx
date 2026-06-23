'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/confirmModal';
import { submitReportAction } from '@/features/reports/actions';
import type { ReportTargetRef, ReportTarget } from '@/features/reports/types';

/** 신고 사유 — BE `reportTypes` enum과 1:1 대응 */
const REPORT_REASONS = [
  '욕설/비속어', // ABUSIVE_LANGUAGE
  '비방/명예훼손', // ABUSE
  '음란물', // OBSCENE
  '스팸/도배', // SPAM
  '상업적 광고', // COMMERCIAL
  '개인정보 노출', // PRIVACY
  '기타', // OTHER
];

/** 대상별 라벨 */
const TARGET_LABEL: Record<ReportTarget, string> = {
  POST: '게시글',
  COMMENT: '댓글',
  REVIEW: '리뷰',
};

interface ReportModalProps {
  /** 신고 대상 (게시글/댓글 + id) */
  target: ReportTargetRef;
  onClose: () => void;
}

export default function ReportModal({ target, onClose }: ReportModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [detail, setDetail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const label = TARGET_LABEL[target.targetType] ?? '콘텐츠';

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason],
    );
    if (error) setError(null);
  };

  // 신고하기 → 사유 검증 후 확인 단계로
  const handleSubmit = () => {
    if (selectedReasons.length === 0) {
      setError('신고 사유를 하나 이상 선택해주세요.');
      return;
    }
    setShowConfirm(true);
  };

  // 확인 → 실제 신고 제출
  const doSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const res = await submitReportAction({
      targetType: target.targetType,
      targetId: target.targetId,
      reasons: selectedReasons,
      detail: detail.trim() || undefined,
    });
    setSubmitting(false);
    if (res.success) {
      toast.success(res.message);
      onClose();
    } else {
      toast.error(res.message);
      setShowConfirm(false);
    }
  };

  // 신고하기 누른 뒤 — 확인 모달
  if (showConfirm) {
    return (
      <ConfirmModal
        title={`${label} 신고`}
        description={`해당 ${label}을 신고 하시겠습니까?`}
        cancelText="취소"
        confirmText="확인"
        confirmVariant="primary"
        onCancel={() => setShowConfirm(false)}
        onConfirm={doSubmit}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-white p-8">
        {/* 헤더 — 제목 가운데 정렬, 닫기 우상단 */}
        <div className="relative mb-1">
          <h2 className="text-center text-xl font-bold text-[#1F2937]">
            {label} 신고
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="mb-5 text-center text-sm text-[#6B7280]">
          신고 사유를 선택해주세요.{' '}
          <span className="text-[#9CA3AF]">(복수 선택 가능)</span>
        </p>

        {/* 신고 사유 (체크 시 빨강 강조) */}
        <div className="mb-4 flex flex-col gap-2">
          {REPORT_REASONS.map((reason) => {
            const checked = selectedReasons.includes(reason);
            return (
              <label
                key={reason}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  checked
                    ? 'border-[#DC2626] bg-[#FEF2F2]'
                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleReason(reason)}
                  className="h-4 w-4 accent-[#DC2626]"
                />
                <span className="text-sm text-[#374151]">{reason}</span>
              </label>
            );
          })}
        </div>

        {error && <p className="mb-3 text-xs text-[#DC2626]">{error}</p>}

        {/* 추가 설명 */}
        <p className="mb-2 text-sm font-semibold text-[#374151]">
          추가 설명 <span className="font-normal text-[#9CA3AF]">(선택)</span>
        </p>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="추가로 전달하실 내용이 있다면 작성해주세요."
          maxLength={500}
          rows={4}
          className="mb-1 w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#374151] placeholder:text-[#9CA3AF] focus:border-[#2F5DAA] focus:outline-none"
        />
        <p className="mb-6 text-right text-xs text-[#9CA3AF]">
          {detail.length}/500
        </p>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-12 flex-1 rounded-xl bg-[#DC2626] text-sm font-semibold text-white hover:bg-[#B91C1C] transition-colors"
          >
            신고하기
          </button>
        </div>
      </div>
    </div>
  );
}
