import { redirect } from 'next/navigation';
import { getSubscriptionServer } from '@/features/subscriptions/server';
import { getOnboardingMeServer } from '@/features/onboarding/server';
import { ScheduleSetupFlow } from '@/features/schedule/components/ScheduleSetupFlow';

export default async function ScheduleSetupPage() {
  // 패스 구독자 전용 — 비구독자가 URL로 직접 진입하면 구독권 페이지로 유도
  const subscription = await getSubscriptionServer();
  if (!subscription.subscribed) {
    redirect('/subscriptions');
  }

  // 온보딩 데이터는 환불/재구독과 무관하게 서버에 남아있다 — 이미 완료했으면 마법사를 다시
  // 보여주지 않고 스케줄 화면으로 보낸다(/schedule과 동일 기준, 결제 완료 화면이 무조건 이
  // 경로로 보내서 매번 재입력하게 되던 문제 수정).
  const onboarding = await getOnboardingMeServer();
  if (onboarding.onboarded) {
    redirect('/schedule');
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-8">
      <div className="mx-auto w-full max-w-[720px]">
        <ScheduleSetupFlow />
      </div>
    </div>
  );
}
