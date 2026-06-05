import { USE_MOCK } from '@/mocks/config';
import { api } from '@/services/api';
import type {
  MyRankingSummary,
  MyRankingDetail,
  RankingPeriod,
} from './types';

/* ───── 내 랭킹 요약 조회 (GET /api/rankings/me) ─────
 * 마이페이지 랭킹 카드 (순공시간/수강량/채택수) 3개에서 사용 */
export async function getMyRankingSummary() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 랭킹 정보를 조회했습니다.',
      data: {
        studyTimeRank: { rank: 42, totalUsers: 350, topPercent: 12.0 },
        lessonRank: { rank: 38, totalUsers: 380, topPercent: 10.0 },
        acceptedCommentRank: { rank: 15, totalUsers: 300, topPercent: 5.0 },
      } as MyRankingSummary,
    };
  }
  return api.get<MyRankingSummary>('/api/rankings/me');
}

/* ───── 내 랭킹 상세 조회 (GET /api/rankings/me?period=daily|weekly|monthly) ─────
 * 랭킹 상세 화면. period 필수. */
export async function getMyRankingDetail(period: RankingPeriod) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 랭킹 상세 정보를 조회했습니다.',
      data: {
        studyTimeRank: 12,
        lessonRank: 8,
        acceptedCommentRank: 21,
        totalUsers: 200,
        topPercent: 6.0,
      } as MyRankingDetail,
    };
  }
  return api.get<MyRankingDetail>(`/api/rankings/me?period=${period}`);
}
