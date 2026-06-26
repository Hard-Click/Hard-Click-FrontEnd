import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import type { DailyStudyStats, DailyStatsQuery } from './types';

/* ───── 일별 순공시간 통계 (GET /api/study-timers/stats/daily) — Server Component 전용 ─────
 * 마이페이지 "오늘 순공시간"용. BE 200·shape({date,studySeconds}) 일치 → isMock('studyTimers')로 라이브.
 * ⚠️ 타이머 패널의 세션(start/heartbeat/end)은 studyTimers/services.ts(USE_MOCK 별도) — 필드 불일치라 mock 유지. */
export async function getDailyStudyStatsServer(
  query: DailyStatsQuery,
): Promise<DailyStudyStats[]> {
  if (isMock('studyTimers')) {
    // 오늘 2시간 30분(9000초) mock — client getDailyStudyStats와 동일
    return [{ date: query.endDate, studySeconds: 9000 }];
  }
  // TODO(API 연동): GET /api/study-timers/stats/daily
  const res = await serverApi.get<DailyStudyStats[]>(
    `/api/study-timers/stats/daily?startDate=${query.startDate}&endDate=${query.endDate}`,
  );
  return res.success && res.data ? res.data : [];
}
