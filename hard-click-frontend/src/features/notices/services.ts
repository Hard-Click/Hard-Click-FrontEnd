import type { Notice } from './types';

const MOCK_NOTICES: Notice[] = [
  {
    noticeId: 1,
    title: '⚠️ 서버 점검 안내 (5월 10일 02:00~04:00)',
    content: '서버 점검으로 인해 서비스 이용이 일시 중단됩니다.',
    isPinned: true,
    createdAt: '2026-05-01',
  },
  {
    noticeId: 2,
    title: '2027 수능 D-197 특별 할인 이벤트 안내',
    content: '수능까지 197일! 전 강의 20% 할인 이벤트를 진행합니다.',
    isPinned: true,
    createdAt: '2026-05-10',
  },
];

export async function getPinnedNotices(): Promise<Notice[]> {
  // TODO: Replace with real API — GET /api/notices?pinned=true
  await new Promise(resolve => setTimeout(resolve, 0));
  return MOCK_NOTICES.filter(n => n.isPinned);
}
