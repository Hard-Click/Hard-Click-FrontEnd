/**
 * getTasksForDateAction 테스트 — 캘린더 날짜 클릭 시 그 날짜의 할 일 조회 액션.
 * Server Action은 공개 엔드포인트라 (1) 날짜 형식을 경계에서 검증하고,
 * (2) 서버가 던진 예외를 success:false 로 삼켜 호출부가 이전 날짜 화면을 유지하게 한다
 *     — 빈 목록으로 위장하지 않는 정직성(§0.1④)을 고정한다.
 * getTasksForDateServer 는 mock 해 액션 계층만 검증한다.
 */
jest.mock('./server', () => ({
  getTasksForDateServer: jest.fn(),
}));

import { getTasksForDateServer } from './server';
import { getTasksForDateAction } from './actions';

const mockServer = getTasksForDateServer as jest.Mock;

beforeEach(() => {
  mockServer.mockReset();
});

describe('getTasksForDateAction — 특정 날짜 할 일 조회', () => {
  it('잘못된 날짜 형식은 서버를 호출하지 않고 success:false', async () => {
    const res = await getTasksForDateAction('2026/07/18'); // 슬래시 = 형식 불일치

    expect(res.success).toBe(false);
    expect(mockServer).not.toHaveBeenCalled();
  });

  it('정상 날짜는 getTasksForDateServer 결과의 tasks를 실어 success:true', async () => {
    mockServer.mockResolvedValue({
      date: '2026-07-18',
      tasks: [
        { id: 'TODO-1', itemId: 1, source: 'TODO', title: '복습', done: false, category: 'OTHER', startTime: '', endTime: '' },
      ],
    });

    const res = await getTasksForDateAction('2026-07-18');

    expect(res.success).toBe(true);
    expect(res.tasks).toHaveLength(1);
    expect(mockServer).toHaveBeenCalledWith('2026-07-18');
  });

  it('서버가 throw하면 success:false로 삼키고 예외를 전파하지 않는다(빈 목록 위장 안 함, §0.1④)', async () => {
    mockServer.mockRejectedValue(new Error('할 일 조회 실패 (500): ERR'));

    const res = await getTasksForDateAction('2026-07-18');

    expect(res.success).toBe(false);
    expect(res.tasks).toBeUndefined();
  });
});
