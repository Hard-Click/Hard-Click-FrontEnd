'use client';

interface DeleteConfirmModalProps {
  title: string;
  /** 예: "게시글을 삭제하시겠습니까?" */
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 관리자 삭제 확인 모달 — 게시글/댓글/답글 삭제 공용.
 * "삭제 후 복구가 불가능합니다." 경고 문구는 고정 표시.
 */
export default function DeleteConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-message"
        className="w-full max-w-[448px] rounded-2xl bg-white p-8 shadow-xl"
      >
        <h2
          id="delete-confirm-title"
          className="text-center text-2xl font-bold text-[#1F2937]"
        >
          {title}
        </h2>
        <p
          id="delete-confirm-message"
          className="mt-3 text-center text-base text-[#4B5563]"
        >
          {message}
          <br />
          <span className="text-sm text-[#DC2626]">
            삭제 후 복구가 불가능합니다.
          </span>
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] transition-colors hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 flex-1 rounded-[10px] bg-[#DC2626] text-base font-semibold text-white transition-colors hover:bg-[#B91C1C]"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
