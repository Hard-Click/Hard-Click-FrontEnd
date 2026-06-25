import { serverApi } from '@/lib/api';
import type { MyActivities } from './types';
import { isMock } from '@/mocks/config';
import { mockMyActivity } from '@/mocks/mypage.mock';

/** 내 활동(게시글/댓글/리뷰) — 서버 조회 (GET /api/members/me/activities) */
export async function getMyActivitiesServer(): Promise<MyActivities | null> {
  if (isMock('mypage')) return mockMyActivity as MyActivities;
  const res = await serverApi.get<MyActivities>('/api/members/me/activities');
  return res.success && res.data ? res.data : null;
}
