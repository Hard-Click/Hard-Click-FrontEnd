'use client';

import { useState } from 'react';
import { toast } from 'sonner';

const REPORT_REASONS = [
  '스팸/광고',
  '욕설/비하',
  '음란물',
  '개인정보 노출',
  '불법 정보',
  '기타',
];

interface ReportModalProps {
  onClose: () => void;
}

export default function ReportModal({ onClose }: ReportModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [detail, setDetail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason],
    );
    if (error) setError(null);
  };

  const handleSubmit = () => {
    if (selectedReasons.length === 0) {
      setError('신고 사유를 하나 이상 선택해주세요.');
      return;
    }
    toast.success('신고가 완료되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1F2937]">신고하기</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 신고 사유 */}
        <p className="mb-3 text-sm font-semibold text-[#374151]">신고 사유</p>
        <div className="mb-4 flex flex-col gap-2">
          {REPORT_REASONS.map((reason) => (
            <label
              key={reason}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E2E8F0] px-4 py-3 hover:bg-[#F8FAFC] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedReasons.includes(reason)}
                onChange={() => toggleReason(reason)}
                className="h-4 w-4 accent-[#2F5DAA]"
              />
              <span className="text-sm text-[#374151]">{reason}</span>
            </label>
          ))}
        </div>

        {error && <p className="mb-3 text-xs text-[#DC2626]">{error}</p>}

        {/* 상세 내용 */}
        <p className="mb-2 text-sm font-semibold text-[#374151]">
          상세 내용 <span className="text-[#9CA3AF] font-normal">(선택)</span>
        </p>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="신고 내용을 자세히 입력해주세요."
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
