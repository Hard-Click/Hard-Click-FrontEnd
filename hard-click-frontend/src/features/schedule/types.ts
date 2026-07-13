/** 캘린더 그리드 한 칸(날짜). 학습바는 3단계(#818)에서 이 위에 얹는다. */
export interface ScheduleCalendarDay {
  /** ISO yyyy-mm-dd */
  date: string;
  /** 1~31 표시용 날짜 */
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}
