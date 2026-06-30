/**
 * MyRankingSummaryCard 테스트 — §0.1② 회귀.
 * BE가 미랭크(rank=null→0 파생) 유저를 "0위·전체 0명·상위 0%"로 위조하지 않고
 * "집계 전"으로 안내하는지 검증.
 */
import { render, screen } from '@testing-library/react';
import MyRankingSummaryCard from './MyRankingSummaryCard';
import type { MyRankingSummary } from '../types';

function summary(
  rank: number,
  totalUsers: number,
  topPercent: number,
): MyRankingSummary {
  const item = { rank, totalUsers, topPercent };
  return {
    studyTimeRank: item,
    lessonRank: item,
    acceptedCommentRank: item,
  };
}

describe('MyRankingSummaryCard — 미랭크 위조 차단(§0.1②)', () => {
  it('순위가 있으면 "전체 M명 · 상위 P%"를 표시하고 집계 전 문구는 없다', () => {
    render(
      <MyRankingSummaryCard metric="studyTime" myRanking={summary(6, 10, 60)} />,
    );

    expect(screen.getByText(/전체 10명.*상위 60%/)).toBeInTheDocument();
    expect(screen.queryByText('집계 전')).not.toBeInTheDocument();
  });

  it('미랭크(rank=0, totalUsers=0)면 "0위" 대신 "집계 전"을 표시한다', () => {
    render(
      <MyRankingSummaryCard metric="studyTime" myRanking={summary(0, 0, 0)} />,
    );

    expect(screen.getByText('집계 전')).toBeInTheDocument();
    expect(screen.getByText('아직 순위가 없어요')).toBeInTheDocument();
    expect(screen.queryByText(/전체 0명/)).not.toBeInTheDocument();
  });

  it('rank>0이지만 totalUsers=0인 비정합도 집계 전으로 처리한다', () => {
    render(
      <MyRankingSummaryCard metric="lessonCount" myRanking={summary(3, 0, 0)} />,
    );

    expect(screen.getByText('집계 전')).toBeInTheDocument();
  });
});
