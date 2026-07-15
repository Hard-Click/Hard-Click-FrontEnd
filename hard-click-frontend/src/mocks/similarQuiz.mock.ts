import { mockQuizzes } from '@/mocks/quizzes.mock';
import { mockEnrolledCourses } from '@/mocks/studentQuizzes.mock';
import type { QuizReviewQuestion } from '@/features/quizzes/types';
import type {
  SimilarQuizDetail,
  SimilarQuizSubmitResult,
} from '@/features/similarQuiz/types';

/**
 * 유사퀴즈 목데이터 (USE_MOCK용) — BE 유사퀴즈 API 미개발이라 mock으로 화면 스캐폴딩.
 * 유사퀴즈 = **강의(course) 단위**. 그 강의의 오답 전체 기반 AI 유사문제. 주차와 무관 → 강의 하나에 유사퀴즈 하나.
 * mock은 BE 응답 shape에 맞춰 설계 → API 나오면 server/actions의 매퍼만 맞추면 UI는 그대로.
 *
 * 결정성: Date/Math.random 미사용. similarQuizId = ID_BASE + courseId 로 인코딩해
 *   제출 시(id만 넘어옴) courseId를 복원·채점할 수 있게 한다.
 */

/** 유사퀴즈 1문항 (정답·해설 포함 — mock 채점용 내부 표현) */
interface MockSimilarQuestion {
  questionId: number;
  content: string;
  options: string[]; // 4개
  answerIndex: number; // 0~3
  explanation: string;
}
interface MockSimilarQuiz {
  similarQuizId: number;
  courseId: number;
  questions: MockSimilarQuestion[];
}

/** similarQuizId 인코딩(mock 전용) — 강의 단위라 courseId만으로 복원 가능 */
const ID_BASE = 9000;
const encodeId = (courseId: number): number => ID_BASE + courseId;
const decodeCourseId = (similarQuizId: number): number => similarQuizId - ID_BASE;

/**
 * 강의별 손작성 유사문제 뱅크 — key = courseId.
 * 없는 강의는 아래 buildMockSimilarQuiz가 그 강의의 퀴즈 문항에서 폴백 생성.
 */
const BANK: Record<number, MockSimilarQuestion[]> = {
  // 강의 1(React) 오답 기반 유사문제
  1: [
    {
      questionId: 9001,
      content: '가상 DOM을 사용하는 주된 이유로 가장 적절한 것은?',
      options: [
        '서버 렌더링을 강제하기 위해',
        '실제 DOM 조작을 최소화해 성능을 높이기 위해',
        'CSS 우선순위를 관리하기 위해',
        '네트워크 요청을 줄이기 위해',
      ],
      answerIndex: 1,
      explanation:
        '가상 DOM은 변경 사항을 메모리에서 비교(diff)한 뒤 실제 DOM 조작을 최소화하여 렌더링 성능을 높입니다.',
    },
    {
      questionId: 9002,
      content: '부모가 자식 컴포넌트로 값을 내려줄 때 사용하는 것은?',
      options: ['state', 'props', 'ref', 'context 필수'],
      answerIndex: 1,
      explanation:
        'props는 부모 → 자식으로 데이터를 전달하는 읽기 전용 속성입니다.',
    },
    {
      questionId: 9003,
      content: '리스트 렌더링에서 key를 지정하는 이유는?',
      options: [
        '스타일을 적용하려고',
        '각 항목을 고유하게 식별해 효율적으로 갱신하려고',
        '이벤트를 위임하려고',
        '접근성을 위해',
      ],
      answerIndex: 1,
      explanation:
        'key는 React가 리스트 항목의 추가/삭제/이동을 정확히 추적해 최소 갱신하게 합니다.',
    },
    {
      questionId: 9004,
      content: '중간 컴포넌트를 거치지 않고 값을 공유하기에 적합한 것은?',
      options: ['props drilling', 'Context API', 'inline style', 'key prop'],
      answerIndex: 1,
      explanation: 'Context API로 트리 깊은 곳까지 값을 직접 전달할 수 있습니다.',
    },
  ],
  // 강의 2(TypeScript) 오답 기반 유사문제
  2: [
    {
      questionId: 9021,
      content: '선언 병합(declaration merging)이 가능한 것은?',
      options: ['type', 'interface', 'enum만', 'namespace 불가'],
      answerIndex: 1,
      explanation:
        'interface는 같은 이름으로 다시 선언하면 병합되지만 type 별칭은 병합되지 않습니다.',
    },
    {
      questionId: 9022,
      content: '"모르는 값"을 안전하게 다룰 때 any 대신 권장되는 타입은?',
      options: ['object', 'unknown', 'never', 'undefined'],
      answerIndex: 1,
      explanation: 'unknown은 사용 전 타입 좁히기를 강제해 any보다 안전합니다.',
    },
    {
      questionId: 9023,
      content: '유니언·튜플 등 형태의 별칭을 정의할 때 적합한 것은?',
      options: ['interface', 'type', 'class', 'abstract'],
      answerIndex: 1,
      explanation:
        '유니언/튜플/별칭은 type으로, 객체 모양은 interface로 표현하는 것이 관례입니다.',
    },
  ],
};

/**
 * courseId → mock 유사퀴즈 구성.
 * 뱅크에 있으면 그대로, 없으면 그 강의의 퀴즈 문항(=오답 출처)에서 폴백 생성.
 * 강의에 퀴즈가 아예 없으면(=오답 출처 없음) null → "유사 문제 없음"으로 처리.
 */
function buildMockSimilarQuiz(courseId: number): MockSimilarQuiz | null {
  const banked = BANK[courseId];
  if (banked) {
    return { similarQuizId: encodeId(courseId), courseId, questions: banked };
  }
  // 폴백(MOCK 필러): 그 강의 퀴즈 문항을 유사문제 재료로 재사용. 실제 BE는 AI로 새 문제를 생성.
  const pool = mockQuizzes
    .filter((q) => q.courseId === courseId)
    .flatMap((q) => q.questions)
    .slice(0, 5);
  if (pool.length === 0) return null;
  return {
    similarQuizId: encodeId(courseId),
    courseId,
    questions: pool.map((q) => ({
      questionId: q.questionId,
      content: q.content,
      options: q.options,
      answerIndex: q.answerIndex,
      explanation: q.explanation,
    })),
  };
}

/** 응시 화면용 유사퀴즈(정답·해설 제외). 오답 출처 없으면 null. */
export function getSimilarQuizMock(courseId: number): SimilarQuizDetail | null {
  const quiz = buildMockSimilarQuiz(courseId);
  if (!quiz) return null;
  const courseTitle =
    mockEnrolledCourses.find((c) => c.courseId === courseId)?.title ?? '';
  return {
    similarQuizId: quiz.similarQuizId,
    courseId,
    courseTitle,
    title: '유사 문제',
    questions: quiz.questions.map((q) => ({
      questionId: q.questionId,
      content: q.content,
      options: q.options,
    })),
  };
}

/**
 * 제출 채점(mock) — similarQuizId에서 courseId를 복원해 유사퀴즈를 재구성·채점.
 * answers = { [questionId]: 선택 보기 인덱스(0~3) }. 미선택은 null.
 */
export function gradeSimilarQuizMock(
  similarQuizId: number,
  answers: Record<number, number>,
): SimilarQuizSubmitResult | null {
  const courseId = decodeCourseId(similarQuizId);
  const quiz = buildMockSimilarQuiz(courseId);
  if (!quiz) return null;

  const questions: QuizReviewQuestion[] = quiz.questions.map((q) => {
    const sel = answers[q.questionId];
    const selectedIndex = sel === undefined ? null : sel;
    return {
      questionId: q.questionId,
      content: q.content,
      options: q.options,
      answerIndex: q.answerIndex,
      selectedIndex,
      explanation: q.explanation,
      correct: selectedIndex === q.answerIndex,
    };
  });
  const totalCount = questions.length;
  const correctCount = questions.filter((q) => q.correct).length;
  const score = totalCount
    ? Math.round((correctCount / totalCount) * 100)
    : 0;
  return { score, correctCount, totalCount, questions };
}
