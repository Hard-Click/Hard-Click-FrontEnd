/**
 * schedule/server.ts 매퍼 테스트 — getTodayTasksServer(라이브 분기)로 private 매퍼
 * (toSource/toItemId/itemKey/courseId 매핑)를 검증한다.
 *
 * 핵심 검증(회귀 포함):
 *  - source='REVIEW' + courseId → TodayTask.source/courseId 그대로 배선(#944 유사퀴즈 진입)
 *  - courseId 미제공 → undefined(§0.1② 없는 값을 0/가짜로 채우지 않음)
 *  - itemKey: source 네임스페이스로 REVIEW(itemId)와 LESSON(slotId)의 같은 숫자 id가 안 겹침
 *  - itemKey: itemId/slotId 둘 다 없으면 planDate+제목 폴백
 *  - source 미제공(구 응답): slotId 있으면 LESSON, 없으면 TODO (기존 폴백 회귀)
 *  - subject 라벨('복습')→category REVIEW / status DONE→done
 *  - 실패 응답({success:false}) → throw
 */

// 라이브 분기 강제 (isMock('schedule') → false)
jest.mock('@/mocks/config', () => ({
  isMock: () => false,
  USE_MOCK: false,
}));

// serverApi.get을 봉투로 stub
jest.mock('@/lib/api', () => ({
  serverApi: { get: jest.fn() },
}));

import { serverApi } from '@/lib/api';
import { getTodayTasksServer } from './server';

const mockGet = serverApi.get as jest.Mock;

function ok<T>(data: T) {
  return { success: true, httpStatus: 200, message: 'OK', data };
}
function fail() {
  return { success: false, httpStatus: 500, message: 'ERR', data: null };
}
/** /api/schedule/me/today 응답(items 래핑)을 돌려주도록 배선 */
function wireToday(items: unknown[]) {
  mockGet.mockResolvedValue(ok({ items, doneCount: 0, totalCount: items.length }));
}

beforeEach(() => {
  mockGet.mockReset();
});

describe('getTodayTasksServer — 오늘 할 일 매핑(toSource/itemKey/courseId)', () => {
  describe('REVIEW courseId 배선 (#944)', () => {
    it("source='REVIEW' 항목의 source·courseId를 그대로 배선한다", async () => {
      wireToday([
        {
          itemId: 1,
          source: 'REVIEW',
          planDate: '2026-07-20',
          subject: '복습',
          title: '지난주 복습 퀴즈',
          courseId: 42,
          status: 'PLANNED',
        },
      ]);

      const { tasks } = await getTodayTasksServer(new Date('2026-07-20T09:00:00'));

      expect(tasks[0]).toMatchObject({
        source: 'REVIEW',
        category: 'REVIEW',
        courseId: 42,
        done: false,
      });
    });

    it('courseId를 안 주면 undefined로 둔다(0/가짜로 채우지 않음)', async () => {
      wireToday([
        { itemId: 2, source: 'REVIEW', planDate: '2026-07-20', subject: '복습', title: '복습' },
      ]);

      const { tasks } = await getTodayTasksServer(new Date('2026-07-20T09:00:00'));

      expect(tasks[0].courseId).toBeUndefined();
    });
  });

  describe('itemKey — source 네임스페이스·폴백', () => {
    it('REVIEW(itemId=1)와 LESSON(slotId=1)의 같은 숫자 id가 source로 분리돼 안 겹친다', async () => {
      wireToday([
        { itemId: 1, source: 'REVIEW', planDate: '2026-07-20', subject: '복습', title: 'R', courseId: 1 },
        { slotId: 1, source: 'LESSON', planDate: '2026-07-20', subject: '수학', title: 'L' },
      ]);

      const { tasks } = await getTodayTasksServer(new Date('2026-07-20T09:00:00'));

      expect(tasks[0].id).toBe('REVIEW-1');
      expect(tasks[1].id).toBe('LESSON-1');
      expect(tasks[0].id).not.toBe(tasks[1].id);
    });

    it('itemId/slotId가 둘 다 없으면 planDate+제목 폴백으로 key를 만든다', async () => {
      wireToday([
        { source: 'REVIEW', planDate: '2026-07-20', subject: '복습', title: '복습 퀴즈', courseId: 3 },
      ]);

      const { tasks } = await getTodayTasksServer(new Date('2026-07-20T09:00:00'));

      expect(tasks[0].id).toBe('REVIEW-2026-07-20-복습 퀴즈');
    });
  });

  describe('source 미제공 폴백 (구 응답 회귀)', () => {
    it('source가 없고 slotId가 있으면 LESSON으로 간주', async () => {
      wireToday([{ slotId: 9012, planDate: '2026-07-20', subject: '영어', title: '듣기', status: 'DONE' }]);

      const { tasks } = await getTodayTasksServer(new Date('2026-07-20T09:00:00'));

      expect(tasks[0]).toMatchObject({ source: 'LESSON', itemId: 9012, done: true, category: 'ENGLISH' });
    });

    it('source도 slotId도 없으면 TODO로 간주', async () => {
      wireToday([{ itemId: 5, planDate: '2026-07-20', title: '직접 추가', status: 'PLANNED' }]);

      const { tasks } = await getTodayTasksServer(new Date('2026-07-20T09:00:00'));

      expect(tasks[0]).toMatchObject({ source: 'TODO', itemId: 5, category: 'OTHER' });
    });
  });

  describe('빈/실패 응답', () => {
    it('items가 없으면 빈 배열', async () => {
      mockGet.mockResolvedValue(ok({ doneCount: 0, totalCount: 0 }));

      const { tasks } = await getTodayTasksServer(new Date('2026-07-20T09:00:00'));

      expect(tasks).toEqual([]);
    });

    it('success=false면 에러를 던진다', async () => {
      mockGet.mockResolvedValue(fail());

      await expect(getTodayTasksServer(new Date('2026-07-20T09:00:00'))).rejects.toThrow(
        '오늘 할 일 조회 실패',
      );
    });
  });
});
