import { api } from '@/services/api';
import type { MyActivities } from './types';

const USE_MOCK = false;

/* ───── 내 활동 조회 (GET /api/members/me/activities) ─────
 * 백엔드 MyActivityController — 내가 작성한 게시글/댓글/수강평을 한 번에 반환. */
export async function getMyActivities() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 활동이 조회되었습니다.',
      data: {
        posts: [
          {
            postId: 1,
            boardType: 'QNA',
            title: 'useEffect 의존성 배열 질문있습니다',
            viewCount: 42,
            accepted: true,
            createdAt: '2026-05-12T14:30:00+09:00',
          },
          {
            postId: 2,
            boardType: 'FREE',
            title: '프론트엔드 공부 같이 하실 분',
            viewCount: 88,
            accepted: false,
            createdAt: '2026-05-08T09:15:00+09:00',
          },
        ],
        comments: [
          {
            commentId: 10,
            postId: 5,
            parentId: null,
            content: '저는 공식 핸드북부터 봤어요. 예제 따라치는 게 도움됐습니다.',
            accepted: true,
            createdAt: '2026-05-11T18:45:00+09:00',
          },
        ],
        reviews: [
          {
            reviewId: 21,
            courseId: 1,
            rating: 5,
            content: '실무에 바로 쓸 수 있는 내용이 많아서 좋았습니다.',
            createdAt: '2026-05-10T21:30:00+09:00',
          },
        ],
      } as MyActivities,
    };
  }
  return api.get<MyActivities>('/api/members/me/activities');
}
