import type { RefObject } from 'react';
import { PwField, type PwCheck } from './PwField';

interface PasswordStepProps {
  newPwRef: RefObject<HTMLInputElement | null>;
  confirmPwRef: RefObject<HTMLInputElement | null>;
  newPw: string;
  newPwConfirm: string;
  showNew: boolean;
  showConfirm: boolean;
  newPwCheck: PwCheck;
  confirmPwCheck: PwCheck;
  onNewPwChange: (v: string) => void;
  onConfirmPwChange: (v: string) => void;
  onToggleNew: () => void;
  onToggleConfirm: () => void;
  canSave: boolean;
  onBack: () => void;
  onSave: () => void;
}

/* ──────────────── Step 3b: 비밀번호 변경 ──────────────── */
export function PasswordStep({
  newPwRef,
  confirmPwRef,
  newPw,
  newPwConfirm,
  showNew,
  showConfirm,
  newPwCheck,
  confirmPwCheck,
  onNewPwChange,
  onConfirmPwChange,
  onToggleNew,
  onToggleConfirm,
  canSave,
  onBack,
  onSave,
}: PasswordStepProps) {
  return (
    <>
      <h3 className="text-lg font-semibold leading-7 text-[#1F2937]">
        비밀번호 변경
      </h3>

      <div className="mt-4 flex flex-col gap-5">
        <PwField
          ref={newPwRef}
          label="새 비밀번호"
          placeholder="새 비밀번호를 입력하세요"
          value={newPw}
          onChange={onNewPwChange}
          show={showNew}
          onToggleShow={onToggleNew}
          check={newPwCheck}
        />
        <PwField
          ref={confirmPwRef}
          label="새 비밀번호 확인"
          placeholder="새 비밀번호를 다시 입력하세요"
          value={newPwConfirm}
          onChange={onConfirmPwChange}
          show={showConfirm}
          onToggleShow={onToggleConfirm}
          check={confirmPwCheck}
        />
      </div>

      <div className="mt-6 flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
        >
          뒤로가기
        </button>
        <button
          type="button"
          onClick={onSave}
          className={`h-12 flex-1 rounded-[10px] text-base font-semibold transition-colors ${
            canSave
              ? 'bg-[#2F5DAA] text-white hover:bg-[#1D3E75]'
              : 'bg-[#E2E8F0] text-[#9CA3AF]'
          }`}
        >
          저장
        </button>
      </div>
    </>
  );
}
