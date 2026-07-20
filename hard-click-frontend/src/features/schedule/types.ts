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

/** "오늘 할 일" 패널 항목 하나. category가 'REVIEW'면 과목 무관 복습 항목, 'OTHER'면 과목 미지정(직접 추가) 항목. */
export interface TodayTask {
  id: string;
  title: string;
  done: boolean;
  category: SubjectCategory;
  /** "HH:mm" 24시간제. 오늘 타임테이블 색상 구간도 이 시간대로 그린다. */
  startTime: string;
  endTime: string;
}

export interface TodayTasksSummary {
  /** ISO yyyy-mm-dd */
  date: string;
  tasks: TodayTask[];
}

/** 슬롯 상태. BE `schedule_slot.status` 와 1:1. MISSED=지난 날짜인데 안 한 학습(자정 배치가 마킹). */
export type ScheduleBlockStatus = 'PLANNED' | 'DONE' | 'MISSED';

/** 캘린더에 그릴 학습 구간 하나(과목 색 바). startDate/endDate 둘 다 ISO yyyy-mm-dd, 양끝 포함. */
export interface ScheduleBlock {
  id: string;
  category: SubjectCategory;
  startDate: string;
  endDate: string;
  /**
   * 슬롯 상태. 'MISSED'면 캘린더에 과목색 대신 검정 막대로 표시한다(못 한 학습).
   * BE가 매일 자정 배치로 지난 미완료 슬롯을 MISSED로 마킹 → FE는 그 값을 표시만 한다.
   * overnight(자정 넘김 할 일) 같은 파생 블록은 상태가 없어 undefined.
   */
  status?: ScheduleBlockStatus;
}

/** 한 주(7칸) 그리드 위에 그릴 학습바 하나 — 겹치는 구간을 그 주 안으로 clamp한 결과. */
export interface WeekBarSegment {
  block: ScheduleBlock;
  /** 1~7 (grid-column 시작, 1-indexed) */
  startCol: number;
  /** 몇 칸을 차지하는지 */
  span: number;
}
