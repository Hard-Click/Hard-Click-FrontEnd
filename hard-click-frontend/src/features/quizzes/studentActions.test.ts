/**
 * submitQuizAction 매퍼 테스트 — 특히 timeSpentSeconds(문제별 풀이 시간) payload 배선.
 * 라이브 분기 강제(isMock=false)해 실서버 매퍼(answerIndex→optionId + 시간 방어)를 탄다.
 * revalidatePath는 next 컨텍스트 밖이라 mock.
 */
jest.mock('@/lib/api', () => ({
  serverApi: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('@/mocks/config', () => ({ isMock: () => false }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

import { serverApi } from '@/lib/api';
import { submitQuizAction } from './studentActions';

const mockGet = serverApi.get as jest.Mock;
const mockPost = serverApi.post as jest.Mock;

/** 응시 상세(GET /api/quizzes/{id}) — questionId별 보기 optionId 순서 */
const QUESTIONS = [
  { questionId: 1, options: [{ optionId: 10 }, { optionId: 11 }, { optionId: 12 }, { optionId: 13 }] },
  { questionId: 2, options: [{ optionId: 20 }, { optionId: 21 }, { optionId: 22 }, { optionId: 23 }] },
];

function okGet() {
  return { success: true, httpStatus: 200, data: { questions: QUESTIONS } };
}
function okPost() {
  return {
    success: true,
    httpStatus: 200,
    data: { score: 100, correctCount: 2, totalQuestionCount: 2 },
  };
}

/** POST 바디의 answers 배열을 꺼낸다. */
function submittedAnswers() {
  return mockPost.mock.calls[0][1].answers as {
    questionId: number;
    selectedOptionId: number;
    timeSpentSeconds: number;
  }[];
}

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockGet.mockResolvedValue(okGet());
  mockPost.mockResolvedValue(okPost());
});

describe('submitQuizAction — timeSpentSeconds payload 배선', () => {
  it('answerIndex→optionId 변환 + 문제별 timeSpentSeconds를 그대로 실어보낸다', async () => {
    await submitQuizAction(5, 7, { 1: 2, 2: 0 }, { 1: 70, 2: 10 });

    expect(mockPost).toHaveBeenCalledWith('/api/quizzes/7/submissions', {
      answers: [
        { questionId: 1, selectedOptionId: 12, timeSpentSeconds: 70 },
        { questionId: 2, selectedOptionId: 20, timeSpentSeconds: 10 },
      ],
    });
  });

  it('시간 맵이 비어 있으면(값 없음) 모든 답안 timeSpentSeconds=0 (BE optional·§0.1: 가짜값 아님)', async () => {
    await submitQuizAction(5, 7, { 1: 0, 2: 0 }, {});
    expect(submittedAnswers().every((a) => a.timeSpentSeconds === 0)).toBe(true);
  });

  it('4번째 인자 미전달(구 호출부 호환)에도 동작 — timeSpentSeconds=0', async () => {
    await submitQuizAction(5, 7, { 1: 0, 2: 0 });
    expect(submittedAnswers().every((a) => a.timeSpentSeconds === 0)).toBe(true);
  });

  it('Server Action 경계 방어: 음수→0, 소수→반올림, NaN→0 (§5)', async () => {
    await submitQuizAction(5, 7, { 1: 1, 2: 3 }, { 1: -5, 2: 70.6 });
    const a = submittedAnswers();
    expect(a.find((x) => x.questionId === 1)?.timeSpentSeconds).toBe(0); // 음수 → 0
    expect(a.find((x) => x.questionId === 2)?.timeSpentSeconds).toBe(71); // 소수 → 반올림

    mockPost.mockClear();
    await submitQuizAction(5, 7, { 1: 0 }, { 1: Number.NaN });
    expect(submittedAnswers()[0].timeSpentSeconds).toBe(0); // NaN → 0
  });

  it('상한을 프론트에서 걸지 않는다(서버 몫) — 큰 값도 그대로 반올림 전송', async () => {
    await submitQuizAction(5, 7, { 1: 0 }, { 1: 99999 });
    expect(submittedAnswers()[0].timeSpentSeconds).toBe(99999);
  });
});
