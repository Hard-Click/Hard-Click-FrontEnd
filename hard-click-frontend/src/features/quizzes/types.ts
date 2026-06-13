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
  explanation: string; // 해설 (필수 — 모든 문제가 해설 보유)
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

/** 등록/수정 폼 입력 — 문제 1개 (서버 생성 필드 없음) */
export interface QuizQuestionInput {
  content: string;
  options: string[]; // 보기 4개
  answerIndex: number; // 정답 0~3 (미선택 -1)
  explanation: string; // 해설 (필수 — 빈 문자열 불가)
}

/** 등록/수정 폼 전체 payload */
export interface QuizFormPayload {
  title: string;
  courseId: number;
  week: number;
  questions: QuizQuestionInput[];
}

/** 점수 현황 — 수강생 1명 행 (강사 화면 — 실명 표시, 마스킹 X) */
export interface QuizScoreRow {
  studentId: string; // 표시용 아이디 (@choiyea2026 — 실명 로마자 기반)
  name: string; // 수강생 실명 (강사가 본인 학생 식별)
  attended: boolean; // 응시 여부
  score: number | null; // 점수 0~100 (미응시 null)
  submittedDate: string | null; // 제출일 YYYY-MM-DD (미응시 null)
}

/** 점수 현황 — 퀴즈 1개 전체 (헤더 브레드크럼용 week/title 포함) */
export interface QuizScoreBoard {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  rows: QuizScoreRow[];
}

/** 수강생 퀴즈 목록 — 주차별 항목 (본인 응시 상태 포함) */
export interface StudentQuizItem {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  questionCount: number;
  attempted: boolean; // 응시 여부
  score: number | null; // 점수 0~100 (미응시 null)
  attemptedDate: string | null; // 응시일 YYYY-MM-DD (미응시 null)
}

/** 응시 화면용 문항 — 정답 없는 표현 (격리막: 정답은 서버 채점 전용) */
export interface StudentQuizQuestion {
  questionId: number;
  content: string; // 문제
  options: string[]; // 보기 4개
}

/** 응시 화면 — 퀴즈 1개 상세 (정답·해설 미포함) */
export interface StudentQuizDetail {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  attempted: boolean; // 이미 응시했는지 (응시 페이지 재진입 차단용 — 재응시 없음)
  questions: StudentQuizQuestion[];
}

/** 퀴즈 제출 채점 결과 (서버에서 채점) */
export interface QuizSubmitResult {
  score: number; // 0~100
  correctCount: number;
  totalCount: number;
}

/** 리뷰(해설) 화면 문항 — 정답·내 답·해설 모두 공개 */
export interface QuizReviewQuestion {
  questionId: number;
  content: string;
  options: string[];
  answerIndex: number; // 정답 인덱스 (0~3)
  selectedIndex: number | null; // 내가 고른 답 (null = 미응시)
  explanation: string; // 해설 (필수)
  correct: boolean; // 정답 여부
}

/** 리뷰(해설) 화면 전체 — 점수 + 향상도(직전 주차 대비) + 문항별 결과 */
export interface StudentQuizReview {
  quizId: number;
  courseId: number;
  week: number;
  title: string;
  courseTitle: string;
  attemptedAt: string; // 응시일시 'YYYY-MM-DD HH:mm'
  score: number; // 0~100
  correctCount: number;
  totalCount: number;
  previousScore: number | null; // 직전 주차 점수 (없으면 null)
  improvement: number | null; // score - previousScore (직전 주차 없으면 null)
  questions: QuizReviewQuestion[];
}
