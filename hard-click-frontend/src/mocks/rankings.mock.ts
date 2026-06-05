/**
 * 랭킹 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/rankings/me, GET /api/rankings/study-time?period=
 */

export interface RankInfo {
  rank: number;
  totalUsers: number;
  topPercent: number;
}

export interface MyRankingApiResponse {
  studyTimeRank: RankInfo;
  lessonRank: RankInfo;
  acceptedCommentRank: RankInfo;
}

export interface StudyTimeRankApiItem {
  rank: number;
  userId: number;
  nickname: string;
  studySeconds: number;
}

export const mockMyRanking: MyRankingApiResponse = {
  studyTimeRank: { rank: 42, totalUsers: 350, topPercent: 12.0 },
  lessonRank: { rank: 38, totalUsers: 380, topPercent: 10.0 },
  acceptedCommentRank: { rank: 15, totalUsers: 300, topPercent: 5.0 },
};

export const mockStudyTimeRanking: StudyTimeRankApiItem[] = [
  { rank: 1, userId: 7, nickname: '스*디', studySeconds: 12000 },
  { rank: 2, userId: 12, nickname: '공*신', studySeconds: 11500 },
  { rank: 3, userId: 5, nickname: '열*생', studySeconds: 10800 },
];
