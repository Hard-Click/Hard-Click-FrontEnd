/**
 * RankingClient 회귀 테스트 — #939/#940.
 * 참여자가 3명 미만이면 포디움(RankingPodium)이 null이라(top3.length<3 → null),
 * rest=slice(3)로는 1~3위가 통째로 사라져 보드가 빈다. 이 테스트는
 *   (1) <3명일 때 전원이 리스트에 표시되는지(버그 재발 방지),
 *   (2) >=3명일 때 포디움+4위~ 리스트 구성이 누락 없이 유지되는지
 * 를 잠근다. `rest = users.slice(3)`로 되돌리면 (1)이 실패한다.
 */
import { render, screen } from '@testing-library/react';
import RankingClient from './RankingClient';
import type { RankingBoard, RankingUser, MyRankingSummary } from '../types';

function user(rank: number, name: string): RankingUser {
  return { rank, name, subtitle: '', value: `${rank * 10}회` };
}

/** 기본 활성 탭(studyTime)에만 유저를 채운 보드 — 나머지 탭은 빈 배열 */
function boardWithStudyTime(users: RankingUser[]): RankingBoard {
  return { studyTime: users, lessonCount: [], acceptedCount: [] };
}

const myRanking: MyRankingSummary = {
  studyTimeRank: { rank: 1, totalUsers: 2, topPercent: 50 },
  lessonRank: { rank: 1, totalUsers: 2, topPercent: 50 },
  acceptedCommentRank: { rank: 1, totalUsers: 2, topPercent: 50 },
};

describe('RankingClient — 참여자 3명 미만 보드(#939 회귀)', () => {
  it('2명이면 포디움 대신 전원(1·2위)을 리스트에 표시한다', () => {
    render(
      <RankingClient
        board={boardWithStudyTime([user(1, '가유저'), user(2, '나유저')])}
        myRanking={myRanking}
      />,
    );
    // 예전엔 rest=slice(3)=[]라 둘 다 사라졌음 → 이제 전원 표시돼야 함
    expect(screen.getByText('가유저')).toBeInTheDocument();
    expect(screen.getByText('나유저')).toBeInTheDocument();
  });

  it('1명(전체 1명, 본인만)이어도 리스트에 표시한다', () => {
    render(
      <RankingClient
        board={boardWithStudyTime([user(1, '가유저')])}
        myRanking={myRanking}
      />,
    );
    expect(screen.getByText('가유저')).toBeInTheDocument();
  });
});

describe('RankingClient — 3명 이상 보드(포디움+리스트 유지)', () => {
  it('4명이면 아무도 누락 없이 전원 표시하고 4위는 리스트에 남는다', () => {
    render(
      <RankingClient
        board={boardWithStudyTime([
          user(1, '가유저'),
          user(2, '나유저'),
          user(3, '다유저'),
          user(4, '라유저'),
        ])}
        myRanking={myRanking}
      />,
    );
    // 포디움(1~3위) + 리스트(4위~) 어느 쪽에서든 전원 렌더 — 누락 회귀 방지
    for (const name of ['가유저', '나유저', '다유저', '라유저']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });
});
