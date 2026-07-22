import CommunityPostCard from './CommunityPostCard';
import PostEmptyState from './PostEmptyState';
import StudyPostCard from './StudyPostCard';
import { BOARD_TYPE_LABEL, type PostListItem } from '../types';
import { parseServerDate } from '../utils';

// 상대 시간 표시 (서버에서 렌더)
function formatDate(isoString: string): string {
  const date = parseServerDate(isoString);
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
  isStudyTab = false,
  hrefPrefix = '/community',
}: {
  posts: PostListItem[];
  isStudyTab?: boolean;
  hrefPrefix?: string;
}) {
  if (posts.length === 0) {
    return <PostEmptyState />;
  }

  return (
    <div
      className={`mt-6 ${
        isStudyTab ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'
      }`}
    >
      {/*
        key는 boardType까지 붙여 유일하게 만든다.
        스터디는 별도 리소스(/api/study)라 groupId가 게시글 postId와 **다른 ID 공간**인데,
        매퍼(toStudyListItem)가 groupId를 postId 자리에 넣어 값이 겹칠 수 있다.
        (실제: 스터디 groupId 3 "안현" ↔ 자유글 postId 3 "안녕하세요 첫 게시글")
        postId만 key로 쓰면 탭 전환(소프트 내비게이션) 시 React가 키가 같은 항목을
        같은 것으로 보고 이전 카드를 재사용해, 다른 게시판 글이 남아 보인다.
      */}
      {posts.map((post) =>
        post.boardType === 'STUDY' ? (
          <StudyPostCard
            key={`${post.boardType}-${post.postId}`}
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
            hrefPrefix={hrefPrefix}
          />
        ) : (
          <CommunityPostCard
            key={`${post.boardType}-${post.postId}`}
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
            hrefPrefix={hrefPrefix}
          />
        )
      )}
    </div>
  );
}
