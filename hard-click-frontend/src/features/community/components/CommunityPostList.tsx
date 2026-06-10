import CommunityPostCard from './CommunityPostCard';
import PostEmptyState from './PostEmptyState';
import StudyPostCard from './StudyPostCard';
import { BOARD_TYPE_LABEL, type PostListItem } from '../types';

// 상대 시간 표시 (서버에서 렌더)
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}

/**
 * 게시글 목록 — **Server Component**. (props로 받은 데이터를 표시만 한다)
 * 데이터 페칭은 상위 page.tsx(서버)에서 끝낸다.
 */
export default function CommunityPostList({
  posts,
}: {
  posts: PostListItem[];
}) {
  if (posts.length === 0) {
    return <PostEmptyState />;
  }

  const isStudyTab = posts.every((p) => p.boardType === 'STUDY');

  return (
    <div
      className={`mt-6 ${
        isStudyTab ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'
      }`}
    >
      {posts.map((post) =>
        post.boardType === 'STUDY' ? (
          <StudyPostCard
            key={post.postId}
            id={post.postId}
            title={post.title}
            subjectName={post.subjectName ?? ''}
            description={post.description ?? '함께 공부하실 분을 찾습니다'}
            currentCount={post.currentCount ?? 0}
            maxCount={post.maxCount ?? 0}
            author={post.authorName}
            time={formatDate(post.createdAt)}
            isMine={post.isMine ?? false}
            isJoined={post.isJoined ?? false}
            variant={isStudyTab ? 'grid' : 'list'}
          />
        ) : (
          <CommunityPostCard
            key={post.postId}
            id={post.postId}
            category={BOARD_TYPE_LABEL[post.boardType]}
            subjectName={post.subjectName ?? undefined}
            title={post.title}
            author={post.authorName}
            time={formatDate(post.createdAt)}
            views={post.viewCount}
            comments={post.commentCount}
            status={
              post.boardType === 'QUESTION'
                ? post.status === 'ADOPTED'
                  ? '채택 완료'
                  : '답변 대기'
                : undefined
            }
          />
        )
      )}
    </div>
  );
}
