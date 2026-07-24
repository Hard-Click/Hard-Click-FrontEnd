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

/** BE 원본 구분 — LESSON(AI 슬롯, 수정/삭제 API 없음) · TODO(학생 추가, CRUD 가능) · REVIEW(오답 기반 복습, 완료 API 없음·유사퀴즈 진입). */
export type TodayTaskSource = 'LESSON' | 'TODO' | 'REVIEW';

/** "오늘 할 일" 패널 항목 하나. category가 'REVIEW'면 과목 무관 복습 항목, 'OTHER'면 과목 미지정(직접 추가) 항목. */
export interface TodayTask {
  /** 화면 리스트 key(`${source}-${itemId ?? slotId}`, id 없으면 planDate+제목 폴백) — id는 source 안에서만 유일해 source로 네임스페이스. */
  id: string;
  /** BE 원본 id. source와 짝지어야 완료체크/CRUD 엔드포인트를 올바르게 고를 수 있다. */
  itemId: number;
  source: TodayTaskSource;
  title: string;
  done: boolean;
  category: SubjectCategory;
  /** "HH:mm" 24시간제. 오늘 타임테이블 색상 구간도 이 시간대로 그린다. */
  startTime: string;
  endTime: string;
  /** category가 'REVIEW'일 때만 의미 있음 — 어느 강의의 오답 기반 복습인지(유사퀴즈 `/quizzes/similar?courseId=` 진입용). */
  courseId?: number;
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
