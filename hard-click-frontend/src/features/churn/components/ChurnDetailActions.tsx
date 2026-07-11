'use client';

import { toast } from '@/lib/toast';

/** 학생 위험 상세 — 액션 버튼 (client 섬). 동작은 BE 연동 후 구현. */
export default function ChurnDetailActions({
  studentName,
}: {
  studentName: string;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        // TODO: 독려 알림 발송 API 연동 (BE 미구현)
        onClick={() => toast.success(`${studentName}님에게 독려 알림을 보냈습니다.`)}
        className="flex h-12 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
      >
        🔔 독려 알림 보내기
      </button>
      <button
        type="button"
        // TODO: 스케줄 재조정 권유 API 연동 (BE 미구현)
        onClick={() =>
          toast.success(`${studentName}님에게 스케줄 재조정을 권유했습니다.`)
        }
        className="flex h-12 items-center gap-2 rounded-xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        📅 스케줄 재조정 권유
      </button>
    </div>
  );
}
