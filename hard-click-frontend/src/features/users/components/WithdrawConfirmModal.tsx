'use client';

interface WithdrawConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 회원 탈퇴 확인 모달 (시안 doubleButton 패턴)
 * width 448 / radius 16 / padding 32 / shadow xl
 */
export default function WithdrawConfirmModal({ onCancel, onConfirm }: WithdrawConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-[448px] bg-white rounded-2xl"
        style={{
          padding: '32px',
          boxShadow:
            '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* 헤더 */}
        <h2 className="text-center text-2xl font-bold leading-8 text-[#1F2937]">회원 탈퇴</h2>

        {/* 본문 */}
        <p className="mt-3 text-center text-base leading-6 text-[#4B5563]">
          정말 탈퇴하시겠습니까?
          <br />
          탈퇴한 계정은 복구할 수 없습니다.
        </p>

        {/* 버튼 */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 flex-1 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
