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
  /** BE 표시 이름 (라이브 검증 2026-06-26: '시연학생'·'학생17' 등). 이전엔 미제공이라 '학습자'로 익명이었음. */
  memberName: string;
  /** 연속 학습일 (BE 제공, 라이브 검증 2026-06-26). subtitle "연속 N일"로 표시(0이면 숨김). */
  currentStreakDays: number;
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
 * BE가 memberName(표시 이름)을 제공(2026-06-26 라이브 확인) → 본인은 "나"(찾기 쉽게),
 *   나머지는 **마스킹**(가운데 *, maskName)해 표시(개인정보 보호 — BE가 실명을 raw로 줘서 FE에서 가림).
 *   빈 이름은 '학습자' 폴백.
 */
function toLiveUser(
  item: RankingViewItem,
  value: string,
  myMemberId: number,
  showStreak: boolean,
): RankingUser {
  const isMe = item.memberId === myMemberId;
  // 개인정보 보호: 본인은 "나", 타인은 BE 실명을 마스킹(가운데 *)해 표시. 빈/공백 이름은 '학습자' 폴백.
  const masked = item.memberName?.trim() ? maskName(item.memberName) : '학습자';
  const name = isMe ? '나' : masked;
  // 연속일(순공 streak)은 순공시간 탭에서만 표시 — 수강/채택 탭은 그 탭 지표(횟수)가 중심.
  const subtitle =
    showStreak && item.currentStreakDays > 0
      ? `연속 ${item.currentStreakDays}일`
      : '';
  return { rank: item.rank, name, subtitle, value, isMe };
}

/**
 * 탭별 랭킹 보드 조회 (Server Component 전용). period=daily|weekly|monthly.
 * 라이브: 3개 지표 엔드포인트를 해당 period로 병렬 조회 → 본인="나"·타인 이름 마스킹 매핑.
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
    // 순공시간 탭만 연속일(streak) subtitle 표시 / 수강·채택 탭은 횟수 value만.
    studyTime: (st.data?.rankings ?? []).map((i) =>
      toLiveUser(i, formatStudyTime(i.studySeconds), myMemberId, true),
    ),
    lessonCount: (ls.data?.rankings ?? []).map((i) =>
      toLiveUser(i, `${i.watchedLessonCount}회`, myMemberId, false),
    ),
    acceptedCount: (ac.data?.rankings ?? []).map((i) =>
      toLiveUser(i, `${i.acceptedCommentCount}회`, myMemberId, false),
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

/** GET /api/rankings/me/summary 응답(BE) — period 없는 3지표 전체 요약. */
interface BeMyRankingSummary {
  studyTime: BeRankSlot;
  lesson: BeRankSlot;
  acceptedComment: BeRankSlot;
}

/**
 * 내 랭킹 "전체 요약" 조회 (마이페이지 카드용 — period 개념 없음).
 * GET /api/rankings/me/summary (3지표 한 번에). 랭킹 페이지의 period별 getMyRankingServer와 의도적 분리.
 */
export async function getMyRankingSummaryServer(): Promise<MyRankingSummary> {
  if (isMock('rankings')) {
    return toMyRanking(mockMyRanking);
  }
  const res = await serverApi.get<BeMyRankingSummary>(
    '/api/rankings/me/summary',
  );
  if (!res.success || !res.data) {
    throw new Error('내 랭킹을 불러오지 못했습니다.');
  }
  return {
    studyTimeRank: toRankItem(res.data.studyTime),
    lessonRank: toRankItem(res.data.lesson),
    acceptedCommentRank: toRankItem(res.data.acceptedComment),
  };
}
