import { serverApi } from '@/lib/api';
import { maskName } from '@/lib/formatter';
import { isMock } from '@/mocks/config';
import {
  mockRankingBoard,
  mockMyRanking,
  type RankingBoardApiResponse,
  type RankingBoardApiItem,
  type MyRankingApiResponse,
} from '@/mocks/rankings.mock';
import type {
  RankingBoard,
  RankingUser,
  RankingPeriod,
  MyRankingSummary,
  RankItem,
} from './types';

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

/** GET /api/rankings/me?metric=&period= 응답 슬롯(BE) — 격리막.
 *  {rank, totalUsers, topPercent}. ⚠️ 활동 시드 전/미랭크 시 rank=null → 0으로 파생(0위 표시). */
interface BeRankSlot {
  rank: number | null;
  totalUsers: number;
  topPercent: number;
}

function toRankItem(slot: BeRankSlot | undefined): RankItem {
  return {
    rank: slot?.rank ?? 0,
    totalUsers: slot?.totalUsers ?? 0,
    topPercent: slot?.topPercent ?? 0,
  };
}

/* ───── 라이브 보드 — GET /api/rankings/{study-time,lessons,accepted-comments}?period= (격리막) ───── */
interface RankingViewItem {
  rank: number;
  memberId: number;
}
interface StudyTimeRankingView {
  rankings: (RankingViewItem & { studySeconds: number })[];
}
interface LessonRankingView {
  rankings: (RankingViewItem & { watchedLessonCount: number })[];
}
interface AcceptedCommentRankingView {
  rankings: (RankingViewItem & { acceptedCommentCount: number })[];
}

/** 순공 초 → "N시간"(1시간 미만은 "N분") */
function formatStudyTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  return h > 0 ? `${h}시간` : `${Math.floor((seconds % 3600) / 60)}분`;
}

/**
 * BE 보드 항목 → UI 항목.
 * ⚠️ BE가 회원 **이름을 안 주고 memberId만** 준다(타 회원 이름 조회 API도 없음) →
 *   본인(myMemberId 일치)은 "나", 나머지는 "학습자"로 **익명화**(§0.1#2: memberId를 이름인 척 노출 ❌).
 *   BE가 닉네임 필드를 추가하면 name을 그 값으로 바꾸면 끝(안현 결정 2026-06-25).
 */
function toLiveUser(
  item: RankingViewItem,
  value: string,
  myMemberId: number,
): RankingUser {
  const isMe = item.memberId === myMemberId;
  return { rank: item.rank, name: isMe ? '나' : '학습자', subtitle: '', value, isMe };
}

/**
 * 탭별 랭킹 보드 조회 (Server Component 전용). period=daily|weekly|monthly.
 * 라이브: 3개 지표 엔드포인트를 해당 period로 병렬 조회 → 익명화 매핑.
 * 실패는 빈 보드로 숨기지 않고 전파 → error.tsx.
 */
export async function getRankingBoardServer(
  period: RankingPeriod,
  myMemberId: number,
): Promise<RankingBoard> {
  if (isMock('rankings')) {
    return toRankingBoard(mockRankingBoard);
  }

  const [st, ls, ac] = await Promise.all([
    serverApi.get<StudyTimeRankingView>(
      `/api/rankings/study-time?period=${period}`,
    ),
    serverApi.get<LessonRankingView>(`/api/rankings/lessons?period=${period}`),
    serverApi.get<AcceptedCommentRankingView>(
      `/api/rankings/accepted-comments?period=${period}`,
    ),
  ]);
  if (!st.success || !ls.success || !ac.success) {
    throw new Error('랭킹을 불러오지 못했습니다.');
  }
  return {
    studyTime: (st.data?.rankings ?? []).map((i) =>
      toLiveUser(i, formatStudyTime(i.studySeconds), myMemberId),
    ),
    lessonCount: (ls.data?.rankings ?? []).map((i) =>
      toLiveUser(i, `${i.watchedLessonCount}회`, myMemberId),
    ),
    acceptedCount: (ac.data?.rankings ?? []).map((i) =>
      toLiveUser(i, `${i.acceptedCommentCount}회`, myMemberId),
    ),
  };
}

/**
 * 내 랭킹 요약 조회 (Server Component 전용) — period별 전체 N명 중 R위 · 상위 P%.
 * /me/summary엔 period가 없어, 지표별 GET /api/rankings/me?metric=&period=를 3개 병렬 조회한다.
 * (metric 값은 보드와 동일: study-time/lessons/accepted-comments)
 */
export async function getMyRankingServer(
  period: RankingPeriod,
): Promise<MyRankingSummary> {
  if (isMock('rankings')) {
    return toMyRanking(mockMyRanking);
  }

  const [st, ls, ac] = await Promise.all([
    serverApi.get<BeRankSlot>(
      `/api/rankings/me?metric=study-time&period=${period}`,
    ),
    serverApi.get<BeRankSlot>(
      `/api/rankings/me?metric=lessons&period=${period}`,
    ),
    serverApi.get<BeRankSlot>(
      `/api/rankings/me?metric=accepted-comments&period=${period}`,
    ),
  ]);
  if (!st.success || !ls.success || !ac.success) {
    throw new Error('내 랭킹을 불러오지 못했습니다.');
  }
  return {
    studyTimeRank: toRankItem(st.data),
    lessonRank: toRankItem(ls.data),
    acceptedCommentRank: toRankItem(ac.data),
  };
}
