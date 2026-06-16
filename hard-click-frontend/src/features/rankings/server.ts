import { serverApi } from '@/lib/api';
import { maskName } from '@/lib/formatter';
import { USE_MOCK } from '@/mocks/config';
import {
  mockRankingBoard,
  mockMyRanking,
  type RankingBoardApiResponse,
  type RankingBoardApiItem,
  type MyRankingApiResponse,
} from '@/mocks/rankings.mock';
import type { RankingBoard, RankingUser, MyRankingSummary } from './types';

/** BE 보드 항목 → UI 계약 매퍼(격리막) */
function toRankingUser(api: RankingBoardApiItem): RankingUser {
  return {
    rank: api.rank,
    // 개인정보 보호: 서버(BFF)에서 이름을 마스킹해 내려보낸다 → 브라우저엔 실명 미노출
    name: maskName(api.name),
    subtitle: api.subtitle,
    value: api.value,
  };
}

function toRankingBoard(api: RankingBoardApiResponse): RankingBoard {
  return {
    studyTime: api.studyTime.map(toRankingUser),
    lessonCount: api.lessonCount.map(toRankingUser),
    acceptedCount: api.acceptedCount.map(toRankingUser),
  };
}

function toMyRanking(api: MyRankingApiResponse): MyRankingSummary {
  return {
    studyTimeRank: api.studyTimeRank,
    lessonRank: api.lessonRank,
    acceptedCommentRank: api.acceptedCommentRank,
  };
}

/**
 * 탭별 랭킹 보드 조회 (Server Component 전용).
 * BE 미구현(노션 명세) → USE_MOCK. 연동 시 엔드포인트/매퍼만 맞추면 됨.
 */
export async function getRankingBoardServer(): Promise<RankingBoard> {
  if (USE_MOCK) {
    return toRankingBoard(mockRankingBoard);
  }

  // TODO(API 연동): GET /api/rankings/{metric}?period= 별 조회 후 합치기.
  // 실패는 빈 보드로 숨기지 않고 전파 → error.tsx에서 처리.
  const res =
    await serverApi.get<RankingBoardApiResponse>('/api/rankings/board');
  if (!res.success || !res.data) {
    throw new Error('랭킹을 불러오지 못했습니다.');
  }
  return toRankingBoard(res.data);
}

/**
 * 내 랭킹 요약 조회 (Server Component 전용) — 전체 N명 중 R위 · 상위 P%.
 */
export async function getMyRankingServer(): Promise<MyRankingSummary> {
  if (USE_MOCK) {
    return toMyRanking(mockMyRanking);
  }

  // TODO(API 연동): GET /api/rankings/me
  const res = await serverApi.get<MyRankingApiResponse>('/api/rankings/me');
  if (!res.success || !res.data) {
    throw new Error('내 랭킹을 불러오지 못했습니다.');
  }
  return toMyRanking(res.data);
}
