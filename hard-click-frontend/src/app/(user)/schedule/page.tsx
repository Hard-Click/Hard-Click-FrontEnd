import { redirect } from 'next/navigation';
import { getSubscriptionServer } from '@/features/subscriptions/server';

export default async function SchedulePage() {
  // 패스 구독자 전용 — 비구독자가 URL로 직접 진입하면 구독권 페이지로 유도
  const subscription = await getSubscriptionServer();
  if (!subscription.subscribed) {
    redirect('/subscriptions');
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1120px]">
        <h1 className="text-3xl font-bold text-[#1E293B]">학습 스케줄</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          AI가 목표와 진도에 맞춰 짜주는 나만의 학습 스케줄이에요.
        </p>

        {/* 월별 캘린더(2단계) · 오늘 할 일·AI 학습 코치(3단계) 후속 */}
        <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-16 text-center text-sm text-[#94A3B8]">
          학습 스케줄 화면을 준비 중입니다.
        </div>
      </div>
    </div>
  );
}
