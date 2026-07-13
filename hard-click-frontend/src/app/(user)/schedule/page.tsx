import { redirect } from 'next/navigation';
import { getSubscriptionServer } from '@/features/subscriptions/server';
import { ScheduleCalendarCard } from '@/features/schedule/components/ScheduleCalendarCard';

export default async function SchedulePage() {
  // 패스 구독자 전용 — 비구독자가 URL로 직접 진입하면 구독권 페이지로 유도
  const subscription = await getSubscriptionServer();
  if (!subscription.subscribed) {
    redirect('/subscriptions');
  }

  const today = new Date();

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1120px]">
        <h1 className="text-3xl font-bold text-[#1E293B]">학습 스케줄</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          AI가 목표와 진도에 맞춰 짜주는 나만의 학습 스케줄이에요.
        </p>

        <div className="mt-8 flex flex-col items-start gap-6 lg:flex-row">
          <div className="w-full lg:flex-[2]">
            <ScheduleCalendarCard year={today.getFullYear()} month={today.getMonth()} />
          </div>
          {/* 오늘 할 일 패널(#819) 자리 — 캘린더 옆 고정 폭으로 예약, 내용은 다음 단계에서 */}
          <div className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-6 lg:w-[300px] lg:flex-none">
            <p className="text-center text-sm text-[#94A3B8]">오늘 할 일 패널을 준비 중입니다.</p>
          </div>
        </div>

        {/* 과목 학습바(#818) · AI 학습 코치(#820) 후속 */}
      </div>
    </div>
  );
}
