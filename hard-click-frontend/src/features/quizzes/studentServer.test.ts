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

/** 리포트 응답(reports/me) 생성 — 점수·scoreDiff·문항만 바꿔가며 씀. */
function makeReport(over: {
  score?: number;
  scoreDiff?: number;
  questions?: typeof Q1[];
}) {
  return {
    quizId: 5,
    week: 2,
    quizTitle: '리뷰 퀴즈',
    submittedAt: '2026-07-10T10:00:00',
    score: over.score ?? 90,
    totalScore: 100,
    correctCount: 1,
    incorrectCount: 0,
    scoreDiff: over.scoreDiff ?? 0,
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

describe('getStudentQuizReviewServer — 향상도 복원 (라이브 매퍼)', () => {
  afterEach(() => jest.clearAllMocks());

  it('scoreDiff>0: 직전 점수 복원 (score 90, +10 → previousScore 80·improvement +10)', async () => {
    setup(makeReport({ score: 90, scoreDiff: 10 }));
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r?.previousScore).toBe(80);
    expect(r?.improvement).toBe(10);
  });

  it('scoreDiff<0: 하락도 복원 (score 70, -10 → previousScore 80·improvement -10)', async () => {
    setup(makeReport({ score: 70, scoreDiff: -10 }));
    const r = await getStudentQuizReviewServer(1, 5);
    expect(r?.previousScore).toBe(80);
    expect(r?.improvement).toBe(-10);
  });

  it('scoreDiff=0: "이전 없음/동점" 구분 불가 → 비교불가(null), 동점 위조 안 함 (§0.1)', async () => {
    setup(makeReport({ score: 100, scoreDiff: 0 }));
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
