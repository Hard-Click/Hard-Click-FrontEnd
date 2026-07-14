import { redirect } from 'next/navigation';
import { getSubscriptionServer } from '@/features/subscriptions/server';
import { ScheduleSetupFlow } from '@/features/schedule/components/ScheduleSetupFlow';

export default async function ScheduleSetupPage() {
  // 패스 구독자 전용 — 비구독자가 URL로 직접 진입하면 구독권 페이지로 유도
  const subscription = await getSubscriptionServer();
  if (!subscription.subscribed) {
    redirect('/subscriptions');
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-8">
      <div className="mx-auto w-full max-w-[720px]">
        <ScheduleSetupFlow />
      </div>
    </div>
  );
}
