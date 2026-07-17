'use client';

import { useTransition } from 'react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { nudgeStudentAction, reflowStudentAction } from '../actions';

/** 학생 위험 상세 — 액션 버튼(client 섬). 독려 알림·스케줄 재조정 권유를 Server Action으로 호출. */
export default function ChurnDetailActions({
  enrollmentId,
  studentName,
}: {
  enrollmentId: number;
  studentName: string;
}) {
  const [isNudging, startNudge] = useTransition();
  const [isReflowing, startReflow] = useTransition();

  const handleNudge = () => {
    startNudge(async () => {
      try {
        const result = await nudgeStudentAction(enrollmentId);
        if (result.success) toast.success(`${studentName}님에게 ${result.message}`);
        else toast.error(result.message);
      } catch {
        toast.error('독려 알림 발송 중 오류가 발생했습니다.');
      }
    });
  };

  const handleReflow = () => {
    startReflow(async () => {
      try {
        const result = await reflowStudentAction(enrollmentId);
        if (result.success) toast.success(`${studentName}님에게 ${result.message}`);
        else toast.error(result.message);
      } catch {
        toast.error('스케줄 재조정 권유 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        disabled={isReflowing}
        onClick={handleReflow}
        className="flex h-12 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:opacity-50"
      >
        <Image src="/icons/calendarIcon.svg" alt="" width={18} height={18} />
        스케줄 재조정 권유
      </button>
      <button
        type="button"
        disabled={isNudging}
        onClick={handleNudge}
        className="flex h-12 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:opacity-50"
      >
        <Image src="/icons/bellBlueIcon.svg" alt="" width={18} height={18} />
        독려 알림 보내기
      </button>
    </div>
  );
}
