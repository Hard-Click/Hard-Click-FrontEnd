import { serverApi } from '@/lib/api';
import { getStudentQuizReviewServer } from './studentServer';

// private 리뷰 매퍼는 export 안 됨 → public getStudentQuizReviewServer로 검증.
// 라이브 분기 강제(isMock=false)해 실서버 매퍼(향상도 복원)를 타게 한다.
jest.mock('@/lib/api', () => ({ serverApi: { get: jest.fn() } }));
jest.mock('@/mocks/config', () => ({ isMock: () => false, USE_MOCK: false }));

const mockGet = serverApi.get as jest.Mock;

/** 성공 봉투 헬퍼: { success, httpStatus, data } */
function ok<T>(data: T) {
  return { success: true, httpStatus: 200, message: 'OK', data };
}

const Q1 = {
  questionId: 1,
  questionNumber: 1,
  questionText: 'Q1',
  correctOptionId: 11,
  selectedOptionId: 11,
  correct: true,
  explanation: '해설1',
  options: [
    { optionId: 11, optionNumber: 1, optionText: 'a' },
    { optionId: 12, optionNumber: 2, optionText: 'b' },
  ],
};

/** 리포트 응답(reports/me) 생성 — 점수·previousScore·문항만 바꿔가며 씀. */
function makeReport(over: {
  score?: number;
  previousScore?: number | null;
  questions?: typeof Q1[];
}) {
  const score = over.score ?? 90;
  const previousScore = over.previousScore ?? null;
  return {
    quizId: 5,
    week: 2,
    quizTitle: '리뷰 퀴즈',
    submittedAt: '2026-07-10T10:00:00',
    score,
    totalScore: 100,
    correctCount: 1,
    incorrectCount: 0,
    previousScore,
    // BE: 직전 없으면 0, 있으면 score − previousScore
    scoreDiff: previousScore != null ? score - previousScore : 0,
    questions: over.questions ?? [Q1],
  };
}

/** reports/me + members/me/courses(병렬) 둘 다 mock. */
function setup(report: ReturnType<typeof makeReport>) {
  mockGet.mockImplementation((url: string) =>
    Promise.resolve(
      url.includes('/members/me/courses')
        ? ok([{ courseId: 1, courseTitle: '수능 국어' }])
        : ok(report),
    ),
  );
}

describe('getStudentQuizReviewServer — 향상도 (라이브 매퍼, BE previousScore 실배선)', () => {
  afterEach(() => jest.clearAllMocks());

  it('직전 있음·향상 (score 90, previousScore 80 → previousScore 80·improvement +10)', async () => {
    setup(makeReport({ score: 90, previousScore: 80 }));
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r?.previousScore).toBe(80);
    expect(r?.improvement).toBe(10);
  });

  it('직전 있음·하락 (score 70, previousScore 80 → previousScore 80·improvement -10)', async () => {
    setup(makeReport({ score: 70, previousScore: 80 }));
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r?.previousScore).toBe(80);
    expect(r?.improvement).toBe(-10);
  });

  it('동점: score 100·previousScore 100 → previousScore 100·improvement 0 (이전없음과 구분 — 핵심 fix)', async () => {
    setup(makeReport({ score: 100, previousScore: 100 }));
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r?.previousScore).toBe(100);
    expect(r?.improvement).toBe(0);
  });

  it('직전 있음·0점 동일 (score 0, previousScore 0 → previousScore 0·improvement 0, null과 구분)', async () => {
    // falsy(0)와 null(이전없음) 구분 — 이 PR의 핵심. truthy 체크로 리팩터 시 즉시 잡힘.
    setup(makeReport({ score: 0, previousScore: 0 }));
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r?.previousScore).toBe(0);
    expect(r?.improvement).toBe(0);
  });

  it('직전 없음: previousScore null → previousScore null·improvement null (동점과 구분, §0.1)', async () => {
    setup(makeReport({ score: 100, previousScore: null }));
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r?.previousScore).toBeNull();
    expect(r?.improvement).toBeNull();
  });

  it('totalCount = questions 길이 (BE totalScore[만점]와 혼동 금지)', async () => {
    setup(makeReport({ questions: [Q1, { ...Q1, questionId: 2, questionNumber: 2 }] }));
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r?.totalCount).toBe(2);
  });

  it('리포트 실패(success:false, 예: 미응시)면 null', async () => {
    mockGet.mockResolvedValue({
      success: false,
      httpStatus: 404,
      message: '미응시',
      data: null,
    });
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r).toBeNull();
  });
});
