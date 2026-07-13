import { redirect } from 'next/navigation';
import { getSubscriptionServer } from '@/features/subscriptions/server';
import { getScheduleBlocksServer, getTodayTasksServer } from '@/features/schedule/server';
import { ScheduleCalendarCard } from '@/features/schedule/components/ScheduleCalendarCard';
import { TodayTaskPanel } from '@/features/schedule/components/TodayTaskPanel';

export default async function SchedulePage() {
  // 패스 구독자 전용 — 비구독자가 URL로 직접 진입하면 구독권 페이지로 유도
  const subscription = await getSubscriptionServer();
  if (!subscription.subscribed) {
    redirect('/subscriptions');
  }

  const today = new Date();
  const [todayTasks, scheduleBlocks] = await Promise.all([
    getTodayTasksServer(today),
    getScheduleBlocksServer(),
  ]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1120px]">
        <h1 className="text-3xl font-bold text-[#1E293B]">학습 스케줄</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          AI가 목표와 진도에 맞춰 짜주는 나만의 학습 스케줄이에요.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-6 lg:flex-row">
          <div className="w-full lg:flex-[2]">
            <ScheduleCalendarCard
              year={today.getFullYear()}
              month={today.getMonth()}
              blocks={scheduleBlocks}
            />
          </div>
          <div className="w-full lg:w-[300px] lg:flex-none">
            <TodayTaskPanel date={todayTasks.date} tasks={todayTasks.tasks} />
          </div>
        </div>

        {/* AI 학습 코치(#820) 후속 */}
      </div>
    </div>
  );
}
