import { api } from '@/services/api';
import type { MyActivities } from './types';
import { USE_MOCK } from '@/mocks/config';
import { mockMyActivity } from '@/mocks/mypage.mock';

/* ───── 내 활동 조회 (GET /api/members/me/activities) ─────
 * 백엔드 MyActivityController — 내가 작성한 게시글/댓글/수강평을 한 번에 반환. */
export async function getMyActivities() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 활동이 조회되었습니다.',
      data: mockMyActivity as MyActivities,
    };
  }
  return api.get<MyActivities>('/api/members/me/activities');
}
