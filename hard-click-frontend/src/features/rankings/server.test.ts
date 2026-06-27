/**
 * rankings/server.ts 매퍼 테스트 — toRankingUser/toRankingBoard(private)를
 * public getRankingBoardServer를 통해 검증한다(라이브 분기 강제).
 *
 * 핵심 검증(회귀 포함):
 *  - memberName → maskName 마스킹(가운데 *), 본인(memberId==myMemberId)은 '나', 빈 이름은 '학습자'
 *  - 연속일(streak) subtitle은 순공(study-time) 탭에서만 / 수강·채택 탭은 횟수(value)
 *  - studySeconds/watchedLessonCount/acceptedCommentCount → value 포맷
 *  - 실패 응답({success:false}) → throw
 */

// 라이브 분기 강제 (isMock('rankings') → false)
jest.mock('@/mocks/config', () => ({
  isMock: () => false,
  USE_MOCK: false,
}));

// serverApi.get을 URL별 envelope로 stub
jest.mock('@/lib/api', () => ({
  serverApi: { get: jest.fn() },
}));

import { serverApi } from '@/lib/api';
import { getRankingBoardServer } from './server';

const mockGet = serverApi.get as jest.Mock;

/** {success:true,...} 봉투로 감싸기 */
function ok<T>(data: T) {
  return { success: true, httpStatus: 200, message: 'OK', data };
}
function fail() {
  return { success: false, httpStatus: 500, message: 'ERR', data: null };
}

/**
 * URL 패턴(study-time / lessons / accepted-comments)에 맞춰
 * 각 탭 fixture를 돌려주도록 mockGet을 배선.
 */
function wireBoard(opts: {
  studyTime?: unknown;
  lessons?: unknown;
  accepted?: unknown;
}) {
  mockGet.mockImplementation((url: string) => {
    if (url.includes('study-time')) return Promise.resolve(opts.studyTime);
    if (url.includes('lessons')) return Promise.resolve(opts.lessons);
    if (url.includes('accepted-comments')) return Promise.resolve(opts.accepted);
    throw new Error(`예상치 못한 URL: ${url}`);
  });
}

beforeEach(() => {
  mockGet.mockReset();
});

describe('getRankingBoardServer — 라이브 보드 매핑(toRankingBoard/toRankingUser/toLiveUser)', () => {
  describe('이름 마스킹·본인·폴백 (회귀)', () => {
    it('타인 이름은 maskName으로 가운데를 마스킹한다', async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '한도선', currentStreakDays: 0, studySeconds: 0 },
            { rank: 2, memberId: 11, memberName: '김민', currentStreakDays: 0, studySeconds: 0 },
            { rank: 3, memberId: 12, memberName: '남궁민수', currentStreakDays: 0, studySeconds: 0 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime.map((u) => u.name)).toEqual(['한*선', '김*', '남**수']);
    });

    it("본인(memberId==myMemberId) 행은 마스킹 대신 '나'로 표시하고 isMe=true", async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 42, memberName: '시연학생', currentStreakDays: 0, studySeconds: 0 },
            { rank: 2, memberId: 11, memberName: '김철수', currentStreakDays: 0, studySeconds: 0 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 42);

      expect(board.studyTime[0]).toMatchObject({ name: '나', isMe: true });
      expect(board.studyTime[1]).toMatchObject({ name: '김*수', isMe: false });
    });

    it("빈 이름/공백 이름은 '학습자'로 폴백한다", async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '', currentStreakDays: 0, studySeconds: 0 },
            { rank: 2, memberId: 11, memberName: '   ', currentStreakDays: 0, studySeconds: 0 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime.map((u) => u.name)).toEqual(['학습자', '학습자']);
    });

    it('1글자 이름은 maskName 규칙대로 그대로 노출된다(가릴 가운데 없음)', async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '김', currentStreakDays: 0, studySeconds: 0 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime[0].name).toBe('김');
    });
  });

  describe('연속일(streak) subtitle — 순공 탭에서만 (회귀)', () => {
    it('순공(study-time) 탭은 currentStreakDays>0이면 "연속 N일" subtitle을 표시', async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '한도선', currentStreakDays: 7, studySeconds: 0 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime[0].subtitle).toBe('연속 7일');
    });

    it('순공 탭이라도 currentStreakDays=0이면 subtitle은 빈 문자열(경계값)', async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '한도선', currentStreakDays: 0, studySeconds: 0 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime[0].subtitle).toBe('');
    });

    it('수강(lessons) 탭은 streak>0이어도 subtitle을 표시하지 않는다', async () => {
      wireBoard({
        studyTime: ok({ rankings: [] }),
        lessons: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '한도선', currentStreakDays: 30, watchedLessonCount: 12 },
          ],
        }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.lessonCount[0].subtitle).toBe('');
    });

    it('채택(accepted-comments) 탭도 streak>0이어도 subtitle을 표시하지 않는다', async () => {
      wireBoard({
        studyTime: ok({ rankings: [] }),
        lessons: ok({ rankings: [] }),
        accepted: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '한도선', currentStreakDays: 5, acceptedCommentCount: 3 },
          ],
        }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.acceptedCount[0].subtitle).toBe('');
    });
  });

  describe('value 포맷 — 탭별 지표', () => {
    it('순공: 1시간 이상은 "N시간"', async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '가', currentStreakDays: 0, studySeconds: 7200 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime[0].value).toBe('2시간');
    });

    it('순공: 1시간 미만은 "N분"(경계값 3599초)', async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '가', currentStreakDays: 0, studySeconds: 3599 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime[0].value).toBe('59분');
    });

    it('순공: 0초는 "0분"(경계값)', async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '가', currentStreakDays: 0, studySeconds: 0 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime[0].value).toBe('0분');
    });

    it('수강: watchedLessonCount → "N회"', async () => {
      wireBoard({
        studyTime: ok({ rankings: [] }),
        lessons: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '가', currentStreakDays: 0, watchedLessonCount: 330 },
          ],
        }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.lessonCount[0].value).toBe('330회');
    });

    it('채택: acceptedCommentCount → "N회"', async () => {
      wireBoard({
        studyTime: ok({ rankings: [] }),
        lessons: ok({ rankings: [] }),
        accepted: ok({
          rankings: [
            { rank: 1, memberId: 10, memberName: '가', currentStreakDays: 0, acceptedCommentCount: 67 },
          ],
        }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.acceptedCount[0].value).toBe('67회');
    });

    it('rank 값은 그대로 전달된다', async () => {
      wireBoard({
        studyTime: ok({
          rankings: [
            { rank: 5, memberId: 10, memberName: '가나', currentStreakDays: 0, studySeconds: 0 },
          ],
        }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('weekly', 999);

      expect(board.studyTime[0].rank).toBe(5);
    });
  });

  describe('빈/누락 데이터 폴백', () => {
    it('rankings가 빈 배열이면 각 탭은 빈 배열', async () => {
      wireBoard({
        studyTime: ok({ rankings: [] }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      const board = await getRankingBoardServer('daily', 999);

      expect(board).toEqual({ studyTime: [], lessonCount: [], acceptedCount: [] });
    });

    it('data가 없어도(undefined rankings) 빈 배열로 폴백', async () => {
      wireBoard({
        studyTime: ok(undefined),
        lessons: ok(undefined),
        accepted: ok(undefined),
      });

      const board = await getRankingBoardServer('daily', 999);

      expect(board).toEqual({ studyTime: [], lessonCount: [], acceptedCount: [] });
    });
  });

  describe('실패 응답 처리', () => {
    it('한 탭이라도 success=false면 에러를 던진다', async () => {
      wireBoard({
        studyTime: ok({ rankings: [] }),
        lessons: fail(),
        accepted: ok({ rankings: [] }),
      });

      await expect(getRankingBoardServer('weekly', 999)).rejects.toThrow(
        '랭킹을 불러오지 못했습니다.',
      );
    });

    it('모든 탭이 실패해도 에러를 던진다', async () => {
      wireBoard({ studyTime: fail(), lessons: fail(), accepted: fail() });

      await expect(getRankingBoardServer('weekly', 999)).rejects.toThrow(
        '랭킹을 불러오지 못했습니다.',
      );
    });
  });

  describe('period 인자 전달', () => {
    it('요청 URL에 전달한 period가 포함된다', async () => {
      wireBoard({
        studyTime: ok({ rankings: [] }),
        lessons: ok({ rankings: [] }),
        accepted: ok({ rankings: [] }),
      });

      await getRankingBoardServer('monthly', 999);

      const urls = mockGet.mock.calls.map((c) => c[0] as string);
      expect(urls).toEqual(
        expect.arrayContaining([
          '/api/rankings/study-time?period=monthly',
          '/api/rankings/lessons?period=monthly',
          '/api/rankings/accepted-comments?period=monthly',
        ]),
      );
    });
  });
});
