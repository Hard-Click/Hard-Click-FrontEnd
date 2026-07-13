import { mockScheduleBlocks, mockTodayTasks } from '@/mocks/schedule.mock';
import type { ScheduleBlock, TodayTasksSummary } from './types';

function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 오늘 할 일 조회 (Server Component 전용).
 * ⚠️ BE 연동 계획 없음(2026-07-13 기준) — 항상 mock. BE 붙으면 여기만 분기 추가.
 */
export async function getTodayTasksServer(today: Date = new Date()): Promise<TodayTasksSummary> {
  return {
    date: toISODate(today),
    tasks: [...mockTodayTasks],
  };
}

/**
 * 캘린더에 그릴 학습 구간 조회 (Server Component 전용).
 * ⚠️ BE 연동 계획 없음(2026-07-13 기준) — 항상 mock. BE 붙으면 여기만 분기 추가.
 */
export async function getScheduleBlocksServer(): Promise<ScheduleBlock[]> {
  return [...mockScheduleBlocks];
}
