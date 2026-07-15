import type { ScheduleBlock, TodayTask } from '@/features/schedule/types';

/**
 * ⚠️ 학습 스케줄러 — BE 연동 계획 없음(2026-07-13 기준, 화면 뼈대 단계).
 * §0.5 정직성: 없는데 있는 것처럼 채우지 않기 위해 mock임을 이 파일·server.ts 양쪽에 명시.
 */
export const mockTodayTasks: readonly TodayTask[] = [
  { id: 'today-1', title: '영어 Unit 3 듣기', done: true, category: 'ENGLISH', startTime: '07:00', endTime: '08:00' },
  { id: 'today-2', title: '수학 미적분 2강', done: false, category: 'MATH', startTime: '14:00', endTime: '16:00' },
  { id: 'today-3', title: '지난주 복습 퀴즈', done: false, category: 'REVIEW', startTime: '20:00', endTime: '21:00' },
];

/** 2026년 7월 캘린더 렌더링 검증용 임의 학습 구간(주 경계를 넘는 케이스 포함). */
export const mockScheduleBlocks: readonly ScheduleBlock[] = [
  { id: 'block-1', category: 'KOREAN', startDate: '2026-07-01', endDate: '2026-07-03' },
  { id: 'block-2', category: 'ENGLISH', startDate: '2026-07-03', endDate: '2026-07-06' },
  { id: 'block-3', category: 'MATH', startDate: '2026-07-06', endDate: '2026-07-11' },
  { id: 'block-4', category: 'SCIENCE', startDate: '2026-07-08', endDate: '2026-07-13' },
  { id: 'block-5', category: 'KOREAN', startDate: '2026-07-12', endDate: '2026-07-16' },
  { id: 'block-6', category: 'ENGLISH', startDate: '2026-07-12', endDate: '2026-07-16' },
  { id: 'block-7', category: 'SOCIAL', startDate: '2026-07-15', endDate: '2026-07-18' },
  { id: 'block-8', category: 'REVIEW', startDate: '2026-07-17', endDate: '2026-07-22' },
  { id: 'block-9', category: 'ENGLISH', startDate: '2026-07-19', endDate: '2026-07-23' },
  { id: 'block-10', category: 'KOREAN', startDate: '2026-07-20', endDate: '2026-07-22' },
  { id: 'block-11', category: 'MATH', startDate: '2026-07-23', endDate: '2026-07-26' },
];

/** AI 학습 코치 배너 임의 코멘트. */
export const mockAiCoachComment =
  '이번 주 페이스 좋아요! 수학이 하루 밀렸는데 오늘 2강까지 들으면 딱 회복돼요.';
