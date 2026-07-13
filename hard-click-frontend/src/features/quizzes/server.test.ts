import { serverApi } from '@/lib/api';
import {
  getQuizFormMetaServer,
  getInstructorQuizDetailServer,
  getQuizzesServer,
  getAdminCourseQuizzesServer,
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

  it('weeks(섹션 orderIndex)↔takenWeeks(퀴즈 weekNumber) 동일 스킴 — 제목 숫자 무시, orderIndex 0 제외·정렬', async () => {
    // 제목 숫자(3/5)와 orderIndex(2/1)가 어긋난 케이스: 제목 정규식이면 weeks=[3,5]로 takenWeeks(1)와 어긋나
    //   중복체크가 깨진다. orderIndex 기반이라야 weeks=[1,2]·takenWeeks=[1]로 정합.
    mockGet.mockImplementation((url: string) =>
      Promise.resolve(
        url.includes('/api/courses/')
          ? ok({
              sections: [
                { sectionId: 1, orderIndex: 2, title: '3단원. 적분' }, // 제목숫자3≠orderIndex2 → 제목 무시
                { sectionId: 2, orderIndex: 1, title: '5단원. 함수' }, // 제목숫자5≠orderIndex1
                { sectionId: 3, orderIndex: 0, title: '오리엔테이션' }, // orderIndex 0 → >0 필터 제외
              ],
            })
          : ok({
              courseId: 1,
              quizzes: [
                {
                  quizId: 9,
                  quizTitle: 'q',
                  courseTitle: 'c',
                  weekNumber: 1, // orderIndex 1 섹션에 퀴즈 (제목상 5단원)
                  sectionTitle: '5단원. 함수',
                  questionCount: 2,
                  createdAt: '2026-07-10T00:00:00',
                },
              ],
            }),
      ),
    );

    const meta = await getQuizFormMetaServer(1);
    expect(meta.weeks).toEqual([1, 2]); // orderIndex 기반(제목 3/5 무시), orderIndex 0(오리엔테이션) 제외
    expect(meta.takenWeeks).toEqual([1]); // orderIndex 1 섹션에 퀴즈 → weekNumber 1과 정합
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

describe('getQuizzesServer / getAdminCourseQuizzesServer — 목록 주차는 BE weekNumber (제목 정규식 X)', () => {
  afterEach(() => jest.clearAllMocks());

  it('강사 목록: 무번호 자유텍스트 섹션명이어도 weekNumber를 그대로 쓴다(정규식이면 0)', async () => {
    mockGet.mockResolvedValue(
      ok({
        courseId: 1,
        sectionId: null,
        quizzes: [
          {
            quizId: 9,
            quizTitle: 'q',
            courseTitle: 'c',
            weekNumber: 3, // 섹션 orderIndex 기반
            sectionTitle: 'ㅇㅇ', // 무번호 자유텍스트 → 정규식이면 0
            questionCount: 2,
            createdAt: '2026-07-10T00:00:00',
          },
        ],
      }),
    );

    const quizzes = await getQuizzesServer(1);
    expect(quizzes[0].week).toBe(3); // 정규식(0) 아니라 weekNumber(3)
  });

  it('관리자 목록(weeks 배열): weekNumber + BE 전용 필드 totalQuestionCount·examDate 매핑', async () => {
    // ⚠️ 관리자 응답(WeeklyQuiz)은 강사 목록과 필드명이 다르다 — 문제수=totalQuestionCount, 날짜=examDate.
    //    강사 목록의 questionCount·createdAt로 읽으면 undefined·빈칸이 되므로 전용 매핑을 검증한다.
    mockGet.mockResolvedValue(
      ok({
        courseId: 1,
        weeks: [
          {
            quizId: 9,
            weekNumber: 2,
            quizTitle: 'q',
            status: 'PUBLISHED',
            totalQuestionCount: 5, // ← questionCount로 매핑돼야
            examDate: '2026-07-10T00:00:00Z', // ← createdDate로 매핑돼야
          },
        ],
      }),
    );

    const quizzes = await getAdminCourseQuizzesServer(1);
    expect(quizzes[0].week).toBe(2); // weekNumber 그대로
    expect(quizzes[0].questionCount).toBe(5); // totalQuestionCount → questionCount
    expect(quizzes[0].createdDate).toBe('2026-07-10'); // examDate → createdDate(날짜만)
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
