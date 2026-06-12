import type { QuizScoreRow } from './types';

/** 점수 구간 — 분포 막대 + 점수 배지 색 공용. 위에서부터 평가해 첫 매칭. */
export const SCORE_BUCKETS = [
  { key: 'excellent', label: '90~100', min: 90, color: '#16A34A' },
  { key: 'good', label: '70~89', min: 70, color: '#2F5DAA' },
  { key: 'fair', label: '50~69', min: 50, color: '#D97706' },
  { key: 'poor', label: '0~49', min: 0, color: '#B91C1C' },
] as const;

export type ScoreBucket = (typeof SCORE_BUCKETS)[number];

/** 점수 → 구간 (미응시=null이면 null). */
export function scoreBucket(score: number | null): ScoreBucket | null {
  if (score === null) return null;
  return (
    SCORE_BUCKETS.find((b) => score >= b.min) ??
    SCORE_BUCKETS[SCORE_BUCKETS.length - 1]
  );
}

export interface ScoreSummary {
  totalCount: number;
  attendedCount: number;
  notAttendedCount: number;
  average: number; // 응시자 평균 (반올림)
  distribution: { label: string; color: string; count: number; percent: number }[];
}

/** 응시/미응시/평균/분포 집계 — 평균·분포는 응시자 기준. */
export function summarizeScores(rows: QuizScoreRow[]): ScoreSummary {
  const attendedCount = rows.filter((r) => r.attended).length;
  const scores = rows
    .map((r) => r.score)
    .filter((s): s is number => s !== null);
  const average = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;
  const distribution = SCORE_BUCKETS.map((b) => {
    const count = scores.filter((s) => scoreBucket(s)?.key === b.key).length;
    return {
      label: b.label,
      color: b.color,
      count,
      percent: scores.length ? Math.round((count / scores.length) * 100) : 0,
    };
  });
  return {
    totalCount: rows.length,
    attendedCount,
    notAttendedCount: rows.length - attendedCount,
    average,
    distribution,
  };
}
