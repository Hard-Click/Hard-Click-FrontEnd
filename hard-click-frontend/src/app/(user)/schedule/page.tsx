import { redirect } from 'next/navigation';
import { getSubscriptionServer } from '@/features/subscriptions/server';
import { getOnboardingMeServer } from '@/features/onboarding/server';
import {
  getAiCoachCommentServer,
  getScheduleBlocksServer,
  getTodayTasksServer,
} from '@/features/schedule/server';
import { ScheduleClientRoot } from '@/features/schedule/components/ScheduleClientRoot';

export default async function SchedulePage() {
  // 패스 구독자 전용 — 비구독자가 URL로 직접 진입하면 구독권 페이지로 유도
  const subscription = await getSubscriptionServer();
  if (!subscription.subscribed) {
    redirect('/subscriptions');
  }

  // 온보딩(목표설정/불가능한 시간/모의고사 성적) 미완료 시 설정 화면으로 유도
  const onboarding = await getOnboardingMeServer();
  if (!onboarding.onboarded) {
    redirect('/schedule/setup');
  }

  const today = new Date();
  const [todayTasks, scheduleBlocks, aiCoachComment] = await Promise.all([
    getTodayTasksServer(today),
    getScheduleBlocksServer(),
    getAiCoachCommentServer(),
  ]);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-[#F5F7FB] px-8 py-6">
      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col overflow-hidden">
        <div className="flex-none">
          <h1 className="text-2xl font-bold text-[#1E293B]">학습 스케줄</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            AI가 목표와 진도에 맞춰 짜주는 나만의 학습 스케줄이에요.
          </p>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col items-stretch gap-4 lg:flex-row">
          <ScheduleClientRoot
            year={today.getFullYear()}
            month={today.getMonth()}
            date={todayTasks.date}
            initialTasks={todayTasks.tasks}
            scheduleBlocks={scheduleBlocks}
            aiCoachComment={aiCoachComment}
          />
        </div>
      </div>
    </div>
  );
}
