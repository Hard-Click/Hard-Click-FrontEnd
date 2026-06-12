/**
 * 강사 퀴즈 도메인 타입.
 * mock(현재)·실서버(추후) 양쪽 다 이 타입을 계약으로 사용 →
 * API 연동 시 services의 mapper만 맞추면 UI는 그대로.
 */

/** 퀴즈 1문항 (4지선다) */
export interface QuizQuestion {
  questionId: number;
  content: string; // 문제
  options: string[]; // 보기 (4개)
  answerIndex: number; // 정답 인덱스 (0~3)
  explanation: string | null; // 해설 (선택)
}

/** 강사 퀴즈 — 강의 + 주차(week)별 */
export interface Quiz {
  quizId: number;
  courseId: number;
  week: number; // 주차 (1, 2, 3 ... 동적)
  title: string; // 퀴즈 제목
  questionCount: number; // 총 문항 수
  createdDate: string; // 등록일 (YYYY-MM-DD)
  questions: QuizQuestion[];
}
