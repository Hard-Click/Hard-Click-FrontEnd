/**
 * CommunityPostList 회귀 — 스터디 groupId ↔ 게시글 postId ID 공간 충돌.
 *
 * 스터디는 /api/study, 게시글은 /api/boards/**\/posts 로 서로 다른 리소스라
 * 두 id가 같은 값일 수 있다(실제: 스터디 groupId 3 ↔ 자유글 postId 3).
 * key를 postId만으로 잡으면 React가 둘을 같은 항목으로 보고 DOM을 재사용해
 * 탭 전환 시 이전 게시판 카드가 남는 버그가 났었다.
 * '전체' 탭은 스터디와 게시글이 한 목록에 섞여 나오므로 여기서 충돌이 재현된다.
 */
import { render, screen } from '@testing-library/react';
import CommunityPostList from './CommunityPostList';
import type { PostListItem } from '../types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), back: jest.fn() }),
  usePathname: () => '/community',
}));

// StudyPostCard가 Server Action(next/cache 의존)을 import → 유닛 환경에서 mock 필요.
jest.mock('@/features/study/actions', () => ({
  joinStudyChatAction: jest.fn(),
  enterStudyChatAction: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href="#">{children}</a>,
}));

const boardPost: PostListItem = {
  postId: 3,
  boardType: 'FREE',
  title: '안녕하세요 첫 게시글입니다',
  authorName: '테*저',
  createdAt: '2026-07-16T13:04:29+09:00',
  viewCount: 1,
  commentCount: 0,
  subjectName: null,
  status: null,
  description: null,
  currentCount: null,
  maxCount: null,
};

/** 게시글과 **같은 id**를 가진 스터디 — 실제 서버 데이터에서 발생한 조합 */
const studyPost: PostListItem = {
  postId: 3,
  groupId: 3,
  boardType: 'STUDY',
  title: '안현',
  authorName: '안*',
  createdAt: '2026-07-18T14:53:38+09:00',
  viewCount: 0,
  commentCount: 0,
  subjectName: '화법과 작문',
  status: null,
  description: 'ㅇㅇㅇㅇㅇ',
  currentCount: 1,
  maxCount: 10,
};

describe('CommunityPostList — id 공간 충돌', () => {
  it('스터디와 게시글의 id가 같아도 둘 다 렌더된다(전체 탭)', () => {
    render(<CommunityPostList posts={[boardPost, studyPost]} />);

    expect(screen.getByText('안녕하세요 첫 게시글입니다')).toBeInTheDocument();
    expect(screen.getByText('안현')).toBeInTheDocument();
  });

  it('id가 같아도 React key 중복 경고가 나지 않는다', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<CommunityPostList posts={[boardPost, studyPost]} />);

    const dupKeyWarning = spy.mock.calls.some((args) =>
      String(args[0]).includes('same key'),
    );
    expect(dupKeyWarning).toBe(false);
    spy.mockRestore();
  });
});
