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

/** 실서버 GET /api/rankings/me/summary 응답(BE) — 격리막.
 *  BE 필드는 studyTime/lesson/acceptedComment(FE는 ~Rank 접미사). ⚠️ 활동 시드 전엔
 *  rank=null·전체 0명으로 옴 → rank는 0으로 파생(0위 표시). 시드되면 자동 채워짐. */
interface BeRankSlot {
  rank: number | null;
  totalUsers: number;
  topPercent: number;
}
interface BeMyRankingSummary {
  studyTime: BeRankSlot;
  lesson: BeRankSlot;
  acceptedComment: BeRankSlot;
}

function toRankItem(slot: BeRankSlot): RankItem {
  return {
    rank: slot.rank ?? 0,
    totalUsers: slot.totalUsers,
    topPercent: slot.topPercent,
  };
}

function toMyRankingFromApi(api: BeMyRankingSummary): MyRankingSummary {
  return {
    studyTimeRank: toRankItem(api.studyTime),
    lessonRank: toRankItem(api.lesson),
    acceptedCommentRank: toRankItem(api.acceptedComment),
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
 * 내 랭킹 요약 조회 (Server Component 전용) — 전체 N명 중 R위 · 상위 P%.
 */
export async function getMyRankingServer(): Promise<MyRankingSummary> {
  if (isMock('rankings')) {
    return toMyRanking(mockMyRanking);
  }

  // 라이브: GET /api/rankings/me/summary (3개 지표 한 번에). ⚠️ 활동 시드 전엔 빈 값(0위).
  const res = await serverApi.get<BeMyRankingSummary>(
    '/api/rankings/me/summary',
  );
  if (!res.success || !res.data) {
    throw new Error('내 랭킹을 불러오지 못했습니다.');
  }
  return toMyRankingFromApi(res.data);
}
