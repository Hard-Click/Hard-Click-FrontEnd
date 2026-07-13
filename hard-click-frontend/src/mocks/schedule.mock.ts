import type { TodayTask } from '@/features/schedule/types';

/**
 * ⚠️ 학습 스케줄러(오늘 할 일) — BE 연동 계획 없음(2026-07-13 기준, 화면 뼈대 단계).
 * §0.5 정직성: 없는데 있는 것처럼 채우지 않기 위해 mock임을 이 파일·server.ts 양쪽에 명시.
 */
export const mockTodayTasks: readonly TodayTask[] = [
  { id: 'today-1', title: '영어 Unit 3 듣기', done: true, category: 'ENGLISH' },
  { id: 'today-2', title: '수학 미적분 2강', done: false, category: 'MATH' },
  { id: 'today-3', title: '지난주 복습 퀴즈', done: false, category: 'REVIEW' },
];
