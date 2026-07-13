import type { SubjectCategory } from '@/features/courses/subjects';

/** 캘린더 그리드 한 칸(날짜). */
export interface ScheduleCalendarDay {
  /** ISO yyyy-mm-dd */
  date: string;
  /** 1~31 표시용 날짜 */
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

/** "오늘 할 일" 패널 항목 하나. category가 'REVIEW'면 과목 무관 복습 항목. */
export interface TodayTask {
  id: string;
  title: string;
  done: boolean;
  category: SubjectCategory;
}

export interface TodayTasksSummary {
  /** ISO yyyy-mm-dd */
  date: string;
  tasks: TodayTask[];
}

/** 캘린더에 그릴 학습 구간 하나(과목 색 바). startDate/endDate 둘 다 ISO yyyy-mm-dd, 양끝 포함. */
export interface ScheduleBlock {
  id: string;
  category: SubjectCategory;
  startDate: string;
  endDate: string;
}

/** 한 주(7칸) 그리드 위에 그릴 학습바 하나 — 겹치는 구간을 그 주 안으로 clamp한 결과. */
export interface WeekBarSegment {
  block: ScheduleBlock;
  /** 1~7 (grid-column 시작, 1-indexed) */
  startCol: number;
  /** 몇 칸을 차지하는지 */
  span: number;
}
