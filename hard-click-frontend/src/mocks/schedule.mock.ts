import type { ScheduleBlock, TodayTask } from '@/features/schedule/types';

/**
 * 학습 스케줄 — `schedule` 도메인은 라이브 연동됨(mocks/config.ts MOCK_OVERRIDE). 이 mock은 로컬에서
 * `USE_MOCK`을 다시 켰을 때만 쓰인다. itemId/source는 FRONTEND_API.md 2번 섹션 예시값과 맞춤.
 */
export const mockTodayTasks: readonly TodayTask[] = [
  { id: 'LESSON-9012', itemId: 9012, source: 'LESSON', title: '영어 Unit 3 듣기', done: true, category: 'ENGLISH', startTime: '07:00', endTime: '08:00' },
  { id: 'LESSON-9013', itemId: 9013, source: 'LESSON', title: '수학 미적분 2강', done: false, category: 'MATH', startTime: '14:00', endTime: '16:00' },
  // courseId 1 = mocks/similarQuiz.mock.ts BANK[1](React) — 유사퀴즈 mock과 짝을 맞춤.
  { id: 'TODO-1', itemId: 1, source: 'TODO', title: '지난주 복습 퀴즈', done: false, category: 'REVIEW', startTime: '20:00', endTime: '21:00', courseId: 1 },
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
