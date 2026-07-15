/**
 * 유사퀴즈(오답 기반 AI 유사문제) 도메인 타입 — 신규 기능.
 *
 * ⚠️ 기존 퀴즈(features/quizzes)는 절대 건드리지 않는다(복제 방식).
 * 응시/해설 표시 컴포넌트를 그대로 재사용하기 위해 shape는 기존 타입을 재사용:
 *  - 응시 문항 = `StudentQuizQuestion`(정답 없는 표현, 격리막)
 *  - 해설 문항 = `QuizReviewQuestion`(정답·내 답·해설 공개)
 *
 * 유사퀴즈 = **강의(course) 단위** 기능. 그 강의의 오답 전체를 기반으로 AI가 유사 문제를 생성.
 * 주차(week)와는 무관 — 강의 하나에 유사퀴즈 하나.
 *
 * 기존 퀴즈와 다른 점:
 *  - 진입 즉시 BE가 생성해 준 문제를 바로 보여줌(동기 생성, "생성 중" 화면 없음)
 *  - 제출 → 응답에 해설 전부 → 같은 화면에서 바로 해설(목록 이동 없음)
 *  - 향상도(직전 주차 비교) 없음 / 재응시 없음(매번 새 문제)
 */
import type {
  StudentQuizQuestion,
  QuizReviewQuestion,
} from '@/features/quizzes/types';

/** 유사퀴즈 응시 상세 — 정답·해설 미포함(격리막). */
export interface SimilarQuizDetail {
  similarQuizId: number; // 제출 연결용(필수)
  courseId: number;
  courseTitle: string; // 헤더 표시용
  title: string;
  questions: StudentQuizQuestion[];
}

/**
 * 유사퀴즈 제출 채점 결과 — 서버 채점.
 * 제출 응답에 해설(QuizReviewQuestion)까지 전부 담겨 옴 → FE는 이 응답으로 바로 해설 렌더.
 * 향상도 필드 없음(기획 결정).
 */
export interface SimilarQuizSubmitResult {
  score: number; // 0~100
  correctCount: number;
  totalCount: number;
  questions: QuizReviewQuestion[];
}
