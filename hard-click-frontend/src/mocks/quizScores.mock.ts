import type { QuizScoreRow } from '@/features/quizzes/types';

/**
 * 강사 퀴즈 점수 현황 목데이터 — quizId별 수강생 응시 결과 (USE_MOCK용).
 * 강사 화면이라 실명 표시(본인 학생 식별 필요) — 강사 엔드포인트는 실명으로 내려온다고 가정.
 * 백엔드 응답 shape에 맞춰 설계 → API 나오면 server의 mapper만 맞추면 됨.
 */
const DEFAULT_ROWS: QuizScoreRow[] = [
  { studentId: '@choiyea2026', name: '최예아', attended: true, score: 100, submittedDate: '2026-05-10' },
  { studentId: '@kimminsu92', name: '김민수', attended: true, score: 90, submittedDate: '2026-05-12' },
  { studentId: '@leesujin01', name: '이수진', attended: true, score: 80, submittedDate: '2026-05-13' },
  { studentId: '@parkjihyun7', name: '박지현', attended: true, score: 70, submittedDate: '2026-05-11' },
  { studentId: '@jungyumin5', name: '정유민', attended: true, score: 60, submittedDate: '2026-05-14' },
  { studentId: '@hanseoyeong3', name: '한서영', attended: false, score: null, submittedDate: null },
];

const mockQuizScores: Record<number, QuizScoreRow[]> = {
  1: DEFAULT_ROWS,
};

/**
 * quizId의 점수 행 반환. mock 단계에선 미등록 퀴즈도 기본 세트로 보여 줌
 * (어떤 퀴즈의 [조회하기]든 화면이 채워지도록).
 */
export function getMockQuizScoreRows(quizId: number): QuizScoreRow[] {
  return mockQuizScores[quizId] ?? DEFAULT_ROWS;
}
