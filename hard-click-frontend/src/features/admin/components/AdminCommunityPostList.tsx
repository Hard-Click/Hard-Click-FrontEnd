import CommunityPostCard from '@/features/community/components/CommunityPostCard';
import StudyPostCard from '@/features/community/components/StudyPostCard';
import PostEmptyState from '@/features/community/components/PostEmptyState';
import {
  BOARD_TYPE_LABEL,
  type PostListItem,
} from '@/features/community/types';
import { formatDate } from '@/features/community/utils';

export default function AdminCommunityPostList({
  posts,
  isStudyTab = false,
}: {
  posts: PostListItem[];
  isStudyTab?: boolean;
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
        key에 boardType을 붙여 유일하게 만든다(사용자 목록 CommunityPostList와 동일 이유).
        스터디(groupId)와 게시글(postId)은 서로 다른 리소스라 ID 공간이 달라 값이 겹칠 수 있다.
        이 화면도 '전체' 탭이 기본이라 두 종류가 한 목록에 섞여 나온다.
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
            variant={isStudyTab ? 'grid' : 'list'}
            hrefPrefix="/admin/community"
            actionLabel="채팅방 보기"
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
            hrefPrefix="/admin/community"
          />
        )
      )}
    </div>
  );
}
