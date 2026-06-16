/** 랭킹(rankings) 도메인 타입 — 노션 RestAPI 명세 매칭 */

/* ───── 내 랭킹 요약 조회 (GET /api/rankings/me) ─────
 * 마이페이지 랭킹 카드 3개에서 사용 */
export interface RankItem {
  rank: number;
  totalUsers: number;
  topPercent: number;
}

export interface MyRankingSummary {
  studyTimeRank: RankItem;
  lessonRank: RankItem;
  acceptedCommentRank: RankItem;
}

/* ───── 내 랭킹 상세 조회 (GET /api/rankings/me?period=) ─────
 * 랭킹 상세 페이지에서 기간별 단건 조회 */
export type RankingPeriod = 'daily' | 'weekly' | 'monthly';

export interface MyRankingDetail {
  studyTimeRank: number;
  lessonRank: number;
  acceptedCommentRank: number;
  totalUsers: number;
  topPercent: number;
}

/* ───── 랭킹 보드 (탭별 순위 목록) — 포디움/테이블 표시용 UI 계약 ───── */
export type RankingTabType = 'studyTime' | 'lessonCount' | 'acceptedCount';

export interface RankingUser {
  rank: number;
  name: string;
  /** 과목 · 학년 등 부가정보 */
  subtitle: string;
  /** 표시 값(예: "334시간" / "330회" / "67회") */
  value: string;
}

/** 탭별 순위 목록 */
export type RankingBoard = Record<RankingTabType, RankingUser[]>;
