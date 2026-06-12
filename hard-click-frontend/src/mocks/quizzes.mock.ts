import type { Quiz } from '@/features/quizzes/types';

/**
 * 강사 퀴즈 목데이터 — 강의별·주차별 (백엔드 연동 전 USE_MOCK용).
 * 백엔드 응답 shape에 맞춰 설계 → API 나오면 services의 mapper만 맞추면 됨.
 */
export const mockQuizzes: Quiz[] = [
  // ── 강의 1 (예: React 완벽 가이드) — 1~4주 ──
  {
    quizId: 1,
    courseId: 1,
    week: 1,
    title: 'React 기초 개념',
    questionCount: 2,
    createdDate: '2026-05-12',
    questions: [
      {
        questionId: 1,
        content: 'React의 가상 DOM이란 무엇인가요?',
        options: ['실제 DOM의 복사본', '메모리에 존재하는 DOM의 표현', 'HTML 파일', 'CSS 스타일시트'],
        answerIndex: 1,
        explanation: '가상 DOM은 메모리에 유지되는 UI 표현으로, 실제 DOM과 효율적으로 동기화됩니다.',
      },
      {
        questionId: 2,
        content: 'JSX는 무엇의 약자인가요?',
        options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
        answerIndex: 0,
        explanation: null,
      },
    ],
  },
  {
    quizId: 2,
    courseId: 1,
    week: 2,
    title: 'Hooks 활용',
    questionCount: 1,
    createdDate: '2026-05-12',
    questions: [
      {
        questionId: 3,
        content: 'useState Hook의 역할은 무엇인가요?',
        options: ['컴포넌트의 상태를 관리', '라우팅 처리', 'API 호출', '스타일 적용'],
        answerIndex: 0,
        explanation: null,
      },
    ],
  },
  {
    quizId: 3,
    courseId: 1,
    week: 3,
    title: '컴포넌트 합성',
    questionCount: 1,
    createdDate: '2026-05-12',
    questions: [
      {
        questionId: 4,
        content: 'props.children의 용도는 무엇인가요?',
        options: ['자식 요소 전달', '상태 관리', '이벤트 처리', '스타일링'],
        answerIndex: 0,
        explanation: null,
      },
    ],
  },
  {
    quizId: 4,
    courseId: 1,
    week: 4,
    title: '상태 관리 심화',
    questionCount: 1,
    createdDate: '2026-05-12',
    questions: [
      {
        questionId: 5,
        content: 'useReducer가 적합한 경우는?',
        options: ['복잡한 상태 로직', '단순 토글', '정적 데이터', '스타일 변경'],
        answerIndex: 0,
        explanation: null,
      },
    ],
  },
  // ── 강의 2 — 1주 ──
  {
    quizId: 5,
    courseId: 2,
    week: 1,
    title: 'TypeScript 기초',
    questionCount: 1,
    createdDate: '2026-05-10',
    questions: [
      {
        questionId: 6,
        content: 'interface와 type의 차이로 옳은 것은?',
        options: ['interface는 선언 병합이 가능', '둘은 완전히 동일', 'type은 객체만 표현', 'interface는 유니언만 가능'],
        answerIndex: 0,
        explanation: null,
      },
    ],
  },
];
