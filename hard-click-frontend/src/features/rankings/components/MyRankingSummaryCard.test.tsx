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

describe('MyRankingSummaryCard — 활성 탭(metric)별 지표·라벨 선택', () => {
  // 세 지표 슬롯에 서로 다른 값 — metric이 올바른 슬롯/라벨을 고르는지 검증한다.
  // (같은 값을 세 슬롯에 넣으면 rankByMetric[metric]/METRIC_LABEL[metric]을 무시해도 통과해 헛검증)
  const board: MyRankingSummary = {
    studyTimeRank: { rank: 6, totalUsers: 100, topPercent: 6 },
    lessonRank: { rank: 12, totalUsers: 100, topPercent: 12 },
    acceptedCommentRank: { rank: 3, totalUsers: 100, topPercent: 3 },
  };

  it("studyTime이면 '순공 시간' 라벨과 studyTimeRank(상위 6%)를 표시한다", () => {
    render(<MyRankingSummaryCard metric="studyTime" myRanking={board} />);

    expect(screen.getByText('순공 시간')).toBeInTheDocument();
    expect(screen.getByText(/전체 100명.*상위 6%/)).toBeInTheDocument();
    expect(screen.queryByText('수강 횟수')).not.toBeInTheDocument();
  });

  it("lessonCount면 '수강 횟수' 라벨과 lessonRank(상위 12%)를 표시한다", () => {
    render(<MyRankingSummaryCard metric="lessonCount" myRanking={board} />);

    expect(screen.getByText('수강 횟수')).toBeInTheDocument();
    expect(screen.getByText(/전체 100명.*상위 12%/)).toBeInTheDocument();
    expect(screen.queryByText('순공 시간')).not.toBeInTheDocument();
  });

  it("acceptedCount면 '채택 횟수' 라벨과 acceptedCommentRank(상위 3%)를 표시한다", () => {
    render(<MyRankingSummaryCard metric="acceptedCount" myRanking={board} />);

    expect(screen.getByText('채택 횟수')).toBeInTheDocument();
    expect(screen.getByText(/전체 100명.*상위 3%/)).toBeInTheDocument();
    expect(screen.queryByText('순공 시간')).not.toBeInTheDocument();
  });
});
