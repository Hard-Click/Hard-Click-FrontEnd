import { serverApi } from '@/lib/api';
import {
  getQuizFormMetaServer,
  getInstructorQuizDetailServer,
  getAdminQuizDetailServer,
} from './server';

// private 매퍼(toQuizDetail 등)는 export 안 됨 → public getXServer로 검증.
// 라이브 분기 강제(isMock=false)해 실서버 매퍼 경로를 타게 한다.
jest.mock('@/lib/api', () => ({ serverApi: { get: jest.fn() } }));
jest.mock('@/mocks/config', () => ({ isMock: () => false, USE_MOCK: false }));

const mockGet = serverApi.get as jest.Mock;

/** 성공 봉투 헬퍼: { success, httpStatus, data } */
function ok<T>(data: T) {
  return { success: true, httpStatus: 200, message: 'OK', data };
}

describe('getQuizFormMetaServer — 섹션→주차 매핑 + 사용 주차 집계 (라이브)', () => {
  afterEach(() => jest.clearAllMocks());

  it('섹션 제목 앞 숫자를 주차로, 무번호 섹션(오리엔테이션)은 제외·dedup·정렬', async () => {
    mockGet.mockImplementation((url: string) =>
      Promise.resolve(
        url.includes('/api/courses/')
          ? ok({
              sections: [
                { sectionId: 1, title: '2단원. 미분' },
                { sectionId: 2, title: '1단원. 함수' },
                { sectionId: 3, title: '오리엔테이션' }, // 숫자 없음 → 0 → 제외
              ],
            })
          : ok({
              courseId: 1,
              quizzes: [
                {
                  quizId: 9,
                  quizTitle: 'q',
                  courseTitle: 'c',
                  sectionTitle: '1단원. 함수',
                  questionCount: 2,
                  createdAt: '2026-07-10T00:00:00',
                },
              ],
            }),
      ),
    );

    const meta = await getQuizFormMetaServer(1);
    expect(meta.weeks).toEqual([1, 2]); // 오리엔테이션(0) 제외 + 정렬
    expect(meta.takenWeeks).toEqual([1]); // 1단원에 퀴즈 존재
  });
});

describe('getInstructorQuizDetailServer — 상세 매퍼 (정답 인덱스 복원)', () => {
  afterEach(() => jest.clearAllMocks());

  it('options[].correct 플래그로 answerIndex를 복원한다', async () => {
    mockGet.mockResolvedValue(
      ok({
        quizId: 5,
        quizTitle: 'q',
        courseId: 1,
        sectionTitle: '2단원',
        createdAt: '2026-07-10T00:00:00',
        questions: [
          {
            questionId: 1,
            questionText: 'Q1',
            explanation: '해설',
            correctOptionId: 12,
            options: [
              { optionId: 11, optionText: 'a', correct: false },
              { optionId: 12, optionText: 'b', correct: true },
            ],
          },
        ],
      }),
    );

    const quiz = await getInstructorQuizDetailServer(5);
    expect(quiz?.week).toBe(2);
    expect(quiz?.questions[0].options).toEqual(['a', 'b']);
    expect(quiz?.questions[0].answerIndex).toBe(1); // correct=true인 2번째
    expect(quiz?.questions[0].explanation).toBe('해설');
  });

  it('correct 플래그가 없으면 correctOptionId로 폴백, explanation null → 빈 문자열', async () => {
    mockGet.mockResolvedValue(
      ok({
        quizId: 5,
        quizTitle: 'q',
        courseId: 1,
        sectionTitle: '1단원',
        createdAt: '2026-07-10T00:00:00',
        questions: [
          {
            questionId: 1,
            questionText: 'Q1',
            explanation: null,
            correctOptionId: 21,
            options: [
              { optionId: 21, optionText: 'a', correct: false },
              { optionId: 22, optionText: 'b', correct: false },
            ],
          },
        ],
      }),
    );

    const quiz = await getInstructorQuizDetailServer(5);
    expect(quiz?.questions[0].answerIndex).toBe(0); // correctOptionId=21 → 0번째
    expect(quiz?.questions[0].explanation).toBe('');
  });
});

describe('getAdminQuizDetailServer — 관리자 상세(문항 포함) 매핑 (라이브)', () => {
  afterEach(() => jest.clearAllMocks());

  it('GET /api/admin/quizzes/{id}(관리자 패밀리)로 조회 + 문항·정답인덱스·해설 매핑', async () => {
    mockGet.mockResolvedValue(
      ok({
        quizId: 90,
        quizTitle: '관리자 수정 퀴즈',
        courseId: 1,
        courseTitle: '수능 국어',
        sectionId: 2,
        sectionTitle: '2주차: 미분',
        questionCount: 1,
        createdAt: '2026-07-10T10:00:00Z',
        questions: [
          {
            questionId: 1,
            questionText: 'Q1',
            explanation: '해설1',
            correctOptionId: 12,
            options: [
              { optionId: 11, optionText: 'a', correct: false },
              { optionId: 12, optionText: 'b', correct: true },
            ],
          },
        ],
      }),
    );

    const quiz = await getAdminQuizDetailServer(90);

    // 강사 엔드포인트로 새지 않고 admin 패밀리로 조회
    expect(mockGet).toHaveBeenCalledWith('/api/admin/quizzes/90');
    expect(quiz?.quizId).toBe(90);
    expect(quiz?.week).toBe(2); // sectionTitle "2주차..." → 2
    expect(quiz?.questions[0].content).toBe('Q1');
    expect(quiz?.questions[0].options).toEqual(['a', 'b']);
    expect(quiz?.questions[0].answerIndex).toBe(1); // correct=true인 2번째
    expect(quiz?.questions[0].explanation).toBe('해설1');
  });

  it('조회 실패(success:false, 예: 없는 퀴즈)면 null', async () => {
    mockGet.mockResolvedValue({
      success: false,
      httpStatus: 404,
      message: '없음',
      data: null,
    });
    expect(await getAdminQuizDetailServer(90)).toBeNull();
  });
});
