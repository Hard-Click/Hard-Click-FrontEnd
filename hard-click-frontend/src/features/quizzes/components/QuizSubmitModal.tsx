/**
 * 퀴즈 제출 확인 모달 — 통계 박스(전체/응시/미응시) + 제출 경고 + 취소/제출(녹색).
 * 표시용 leaf(상태·핸들러는 props). 통계 박스가 필요해 공용 ConfirmModal 대신 전용.
 */
export default function QuizSubmitModal({
  totalCount,
  answeredCount,
  unansweredCount,
  submitting,
  onCancel,
  onConfirm,
}: {
  totalCount: number;
  answeredCount: number;
  unansweredCount: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const rows = [
    { label: '전체 문항', value: `${totalCount}문항`, color: 'text-[#1F2937]' },
    { label: '응시 완료', value: `${answeredCount}문항`, color: 'text-[#16A34A]' },
    { label: '미응시', value: `${unansweredCount}문항`, color: 'text-[#F59E0B]' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-submit-title"
    >
      <div className="w-full max-w-[448px] rounded-2xl bg-white p-8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <h2
          id="quiz-submit-title"
          className="text-center text-2xl font-bold text-[#1F2937]"
        >
          퀴즈를 제출하시겠습니까?
        </h2>

        <div className="mt-6 flex flex-col gap-2 rounded-[20px] bg-[#F8FAFC] p-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-sm text-[#4B5563]">{r.label}</span>
              <span className={`text-base font-semibold ${r.color}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-[#4B5563]">
          제출 후에는 답안을 수정할 수 없습니다.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="h-12 flex-1 rounded-[10px] bg-[#16A34A] text-base font-semibold text-white transition hover:bg-[#15803D] disabled:opacity-60"
          >
            {submitting ? '제출 중...' : '제출'}
          </button>
        </div>
      </div>
    </div>
  );
}
