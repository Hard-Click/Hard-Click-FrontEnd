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
        difficulty: 1,
        explanation: '가상 DOM은 메모리에 유지되는 UI 표현으로, 실제 DOM과 효율적으로 동기화됩니다.',
      },
      {
        questionId: 2,
        content: 'JSX는 무엇의 약자인가요?',
        options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
        answerIndex: 0,
        difficulty: 2,
        explanation:
          'JSX는 JavaScript XML의 약자로, JavaScript 안에서 HTML과 유사한 문법을 사용할 수 있게 해줍니다.',
      },
    ],
  },
  {
    quizId: 2,
    courseId: 1,
    week: 2,
    title: 'React 핵심 개념',
    questionCount: 5,
    createdDate: '2026-05-12',
    questions: [
      {
        questionId: 20,
        content: 'React의 가상 DOM이란 무엇인가요?',
        options: [
          '실제 DOM의 복사본',
          '메모리에 존재하는 DOM의 표현',
          'HTML 파일',
          'CSS 스타일시트',
        ],
        answerIndex: 1,
        difficulty: 3,
        explanation:
          '가상 DOM은 메모리에 존재하는 DOM의 표현으로, 실제 DOM 조작을 최소화하여 성능을 향상시킵니다.',
      },
      {
        questionId: 21,
        content: 'JSX는 무엇의 약자인가요?',
        options: [
          'JavaScript XML',
          'Java Syntax Extension',
          'JSON XML',
          'JavaScript Extension',
        ],
        answerIndex: 0,
        difficulty: 1,
        explanation:
          'JSX는 JavaScript XML의 약자로, JavaScript 안에서 HTML과 유사한 문법을 사용할 수 있게 해줍니다.',
      },
      {
        questionId: 22,
        content: 'React 컴포넌트의 props는 무엇을 의미하나요?',
        options: [
          '컴포넌트의 내부 상태',
          '컴포넌트 간 데이터를 전달하는 속성',
          '스타일 정보',
          '이벤트 핸들러',
        ],
        answerIndex: 1,
        difficulty: 2,
        explanation: 'props는 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 속성입니다.',
      },
      {
        questionId: 23,
        content: 'React에서 key prop이 필요한 이유는 무엇인가요?',
        options: [
          '스타일을 적용하기 위해',
          '리스트의 각 항목을 고유하게 식별하기 위해',
          '이벤트를 처리하기 위해',
          '라우팅을 위해',
        ],
        answerIndex: 1,
        difficulty: 3,
        explanation:
          'key는 React가 리스트의 각 항목을 고유하게 식별하여 효율적으로 업데이트할 수 있게 합니다.',
      },
      {
        questionId: 24,
        content: 'React의 생명주기 메서드는 언제 사용하나요?',
        options: [
          '컴포넌트가 렌더링될 때',
          '컴포넌트의 특정 시점에 코드를 실행할 때',
          'API를 호출할 때만',
          '스타일을 변경할 때',
        ],
        answerIndex: 1,
        difficulty: 1,
        explanation:
          '생명주기 메서드는 컴포넌트가 마운트, 업데이트, 언마운트되는 특정 시점에 코드를 실행하기 위해 사용됩니다.',
      },
    ],
  },
  {
    quizId: 3,
    courseId: 1,
    week: 3,
    title: '컴포넌트 합성',
    questionCount: 6,
    createdDate: '2026-05-12',
    questions: [
      {
        questionId: 10,
        content: 'props.children의 용도는 무엇인가요?',
        options: ['자식 요소 전달', '상태 관리', '이벤트 처리', '스타일링'],
        answerIndex: 0,
        difficulty: 2,
        explanation:
          '컴포넌트 태그 사이에 넣은 자식 요소를 props.children으로 전달받아 합성합니다.',
      },
      {
        questionId: 11,
        content: 'React에서 key prop이 필요한 이유는 무엇인가요?',
        options: [
          '스타일을 적용하기 위해',
          '리스트의 각 항목을 고유하게 식별하기 위해',
          '이벤트를 처리하기 위해',
          '라우팅을 위해',
        ],
        answerIndex: 1,
        difficulty: 3,
        explanation:
          'key는 리스트 항목을 고유하게 식별해 React가 변경을 효율적으로 추적하게 합니다.',
      },
      {
        questionId: 12,
        content: 'React의 생명주기(부수 효과)와 가장 관련 있는 Hook은?',
        options: ['useState', 'useEffect', 'useMemo', 'useRef'],
        answerIndex: 1,
        difficulty: 1,
        explanation:
          'useEffect로 마운트·업데이트·언마운트 시점의 부수 효과를 처리합니다.',
      },
      {
        questionId: 13,
        content: '불필요한 리렌더링을 막기 위해 컴포넌트를 메모이제이션하는 API는?',
        options: ['React.memo', 'useReducer', 'useContext', 'forwardRef'],
        answerIndex: 0,
        difficulty: 2,
        explanation: 'React.memo는 props가 같으면 리렌더링을 건너뜁니다.',
      },
      {
        questionId: 14,
        content: '여러 컴포넌트에 전역적으로 값을 전달할 때 적합한 것은?',
        options: ['props drilling', 'Context API', 'inline style', 'key prop'],
        answerIndex: 1,
        difficulty: 3,
        explanation: 'Context API로 중간 컴포넌트를 거치지 않고 값을 공유합니다.',
      },
      {
        questionId: 15,
        content: 'JSX 내 조건부 렌더링에 직접 사용할 수 없는 것은?',
        options: ['삼항 연산자', '&& 연산자', '즉시실행 함수', 'for 문'],
        answerIndex: 3,
        difficulty: 1,
        explanation:
          'for 문은 표현식이 아니라 JSX 안에서 직접 조건부 렌더링에 쓰지 않습니다.',
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
        difficulty: 2,
        explanation:
          'useReducer는 여러 값이 얽힌 복잡한 상태 로직을 다룰 때 useState보다 적합합니다.',
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
        difficulty: 3,
        explanation:
          'interface는 같은 이름으로 다시 선언하면 자동으로 병합(선언 병합)되지만, type은 병합되지 않습니다.',
      },
    ],
  },
];
