/**
 * submitSimilarQuizAction 매퍼 테스트 — timeSpentSeconds(문제별 풀이 시간) payload 배선.
 * 라이브 분기 강제(isMock=false)해 실서버 매퍼(검증 + 시간 방어)를 탄다.
 * 정규 퀴즈(quizzes/studentActions)와 동일한 미측정=null 계약을 유지하는지 고정한다.
 */
jest.mock('@/lib/api', () => ({
  serverApi: { post: jest.fn() },
}));
jest.mock('@/mocks/config', () => ({ isMock: () => false }));
// revalidatePath는 next 요청 컨텍스트 밖이라 mock(제출 성공 시 /schedule 재검증 호출).
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

import { serverApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { submitSimilarQuizAction } from './actions';

const mockPost = serverApi.post as jest.Mock;
const mockRevalidate = revalidatePath as jest.Mock;

function okPost() {
  return {
    success: true,
    httpStatus: 200,
    data: {
      score: 100,
      correctCount: 2,
      totalCount: 2,
      questions: [],
    },
  };
}

/** POST 바디의 answers 배열을 꺼낸다. */
function submittedAnswers() {
  return mockPost.mock.calls[0][1].answers as {
    questionId: number;
    selectedIndex: number;
    timeSpentSeconds: number | null;
  }[];
}

beforeEach(() => {
  mockPost.mockReset();
  mockPost.mockResolvedValue(okPost());
  mockRevalidate.mockReset();
});

describe('submitSimilarQuizAction — timeSpentSeconds payload 배선', () => {
  it('문제별 측정값을 selectedIndex와 함께 그대로 실어보낸다', async () => {
    await submitSimilarQuizAction(9, { 1: 2, 2: 0 }, { 1: 70, 2: 10 });

    expect(mockPost).toHaveBeenCalledWith('/api/similar-quizzes/9/submit', {
      answers: [
        { questionId: 1, selectedIndex: 2, timeSpentSeconds: 70 },
        { questionId: 2, selectedIndex: 0, timeSpentSeconds: 10 },
      ],
    });
  });

  it('시간 맵이 비어 있으면(미측정) timeSpentSeconds=null — 0을 보내면 "0초에 풀었다"와 구분 불가', async () => {
    await submitSimilarQuizAction(9, { 1: 0, 2: 3 }, {});
    expect(submittedAnswers().every((a) => a.timeSpentSeconds === null)).toBe(
      true,
    );
  });

  it('3번째 인자 미전달(구 호출부 호환)에도 동작 — timeSpentSeconds=null', async () => {
    await submitSimilarQuizAction(9, { 1: 0 });
    expect(submittedAnswers()[0].timeSpentSeconds).toBeNull();
  });

  it('Server Action 경계 방어: 음수→null, 소수→반올림, NaN→null (§5)', async () => {
    await submitSimilarQuizAction(9, { 1: 1, 2: 3 }, { 1: -5, 2: 70.6 });
    const a = submittedAnswers();
    expect(a.find((x) => x.questionId === 1)?.timeSpentSeconds).toBeNull();
    expect(a.find((x) => x.questionId === 2)?.timeSpentSeconds).toBe(71);

    mockPost.mockClear();
    await submitSimilarQuizAction(9, { 1: 0 }, { 1: Number.NaN });
    expect(submittedAnswers()[0].timeSpentSeconds).toBeNull();
  });

  it('실측값이 0으로 반올림되면(찍고 바로 넘김) null이 아니라 진짜 0을 보낸다', async () => {
    await submitSimilarQuizAction(9, { 1: 0 }, { 1: 0.2 });
    expect(submittedAnswers()[0].timeSpentSeconds).toBe(0);
  });

  it('상한을 프론트에서 걸지 않는다(서버 몫) — 1시간 초과도 그대로 전송', async () => {
    await submitSimilarQuizAction(9, { 1: 0 }, { 1: 99999 });
    expect(submittedAnswers()[0].timeSpentSeconds).toBe(99999);
  });

  it('BE DTO(32비트 Integer) 범위를 넘는 값은 null — 역직렬화 400으로 제출 전체가 실패하는 것 방지', async () => {
    await submitSimilarQuizAction(9, { 1: 0 }, { 1: 1e10 });
    expect(submittedAnswers()[0].timeSpentSeconds).toBeNull();

    mockPost.mockClear();
    await submitSimilarQuizAction(9, { 1: 0 }, { 1: 2147483647 });
    expect(submittedAnswers()[0].timeSpentSeconds).toBe(2147483647);
  });

  it('답안 검증 실패(selectedIndex 범위 밖)면 전송하지 않는다', async () => {
    const res = await submitSimilarQuizAction(9, { 1: 9 }, { 1: 30 });
    expect(res.success).toBe(false);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('제출 성공 시 /schedule 캐시를 무효화한다(복습 done/진행률 최신 반영)', async () => {
    const res = await submitSimilarQuizAction(9, { 1: 2, 2: 0 });
    expect(res.success).toBe(true);
    expect(mockRevalidate).toHaveBeenCalledWith('/schedule');
  });

  it('캐시 무효화가 던져도 제출 성공을 실패로 뒤집지 않는다(best-effort, §0.1④)', async () => {
    mockRevalidate.mockImplementationOnce(() => {
      throw new Error('revalidate boom');
    });
    const res = await submitSimilarQuizAction(9, { 1: 2, 2: 0 });
    expect(res.success).toBe(true);
  });
});
