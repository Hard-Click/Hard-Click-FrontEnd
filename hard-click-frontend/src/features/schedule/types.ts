import type { SubjectCategory } from '@/features/courses/subjects';

/** 캘린더 그리드 한 칸(날짜). 학습바는 3단계(#818)에서 이 위에 얹는다. */
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
