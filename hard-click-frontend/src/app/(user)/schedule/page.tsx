import { redirect } from 'next/navigation';
import { getSubscriptionServer } from '@/features/subscriptions/server';
import {
  getAiCoachCommentServer,
  getScheduleBlocksServer,
  getTodayTasksServer,
} from '@/features/schedule/server';
import { ScheduleCalendarCard } from '@/features/schedule/components/ScheduleCalendarCard';
import { TodayScheduleGroup } from '@/features/schedule/components/TodayScheduleGroup';
import { AiCoachBanner } from '@/features/schedule/components/AiCoachBanner';

export default async function SchedulePage() {
  // 패스 구독자 전용 — 비구독자가 URL로 직접 진입하면 구독권 페이지로 유도
  const subscription = await getSubscriptionServer();
  if (!subscription.subscribed) {
    redirect('/subscriptions');
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
          <ScheduleCalendarCard
            year={today.getFullYear()}
            month={today.getMonth()}
            blocks={scheduleBlocks}
            className="lg:flex-1"
          />
          {/* 오늘 할 일 + 타임테이블 + AI 코치 묶음 — 이 전체 높이가 캘린더와 동일해야(flex 형제 stretch) 끝선이 맞는다 */}
          <div className="flex w-full flex-col gap-4 lg:w-[536px] lg:flex-none">
            <TodayScheduleGroup date={todayTasks.date} initialTasks={todayTasks.tasks} />
            <AiCoachBanner comment={aiCoachComment} />
          </div>
        </div>
      </div>
    </div>
  );
}
