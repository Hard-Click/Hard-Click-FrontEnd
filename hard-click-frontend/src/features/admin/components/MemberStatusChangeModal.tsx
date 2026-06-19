'use client';

import type { AdminUser } from '@/features/users/types';

interface MemberStatusChangeModalProps {
  user: AdminUser;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 계정 잠금/해제 확인 모달.
 * 활성 계정 → 잠금, 잠김 계정 → 해제 문구·색상 분기.
 */
export default function MemberStatusChangeModal({
  user,
  onCancel,
  onConfirm,
}: MemberStatusChangeModalProps) {
  const isActive = user.status === 'ACTIVE';
  const actionLabel = isActive ? '잠금' : '해제';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-status-title"
        aria-describedby="member-status-message"
        className="w-full max-w-[400px] rounded-3xl bg-white p-8 shadow-xl"
      >
        <h2
          id="member-status-title"
          className="text-center text-2xl font-bold text-[#1F2937]"
        >
          계정 {actionLabel}
        </h2>
        <p
          id="member-status-message"
          className="mt-3 text-center text-base text-[#4B5563]"
        >
          <span className="font-semibold text-[#1F2937]">{user.name}</span>님의
          계정을 {actionLabel}하시겠습니까?
          <br />
          <span className="text-sm text-[#64748B]">
            {isActive
              ? '잠금 시 해당 사용자는 커뮤니티 이용에 제한됩니다.'
              : '해제 시 해당 사용자는 커뮤니티 이용이 가능합니다.'}
          </span>
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 flex-1 rounded-[12px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] transition-colors hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 flex-1 rounded-[12px] text-base font-semibold text-white transition-colors ${
              isActive
                ? 'bg-[#F97316] hover:bg-[#EA580C]'
                : 'bg-[#16A34A] hover:bg-[#15803D]'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
