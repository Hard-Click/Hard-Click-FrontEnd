import Image from 'next/image';
import PostActionButtons from '@/features/community/components/PostActionButtons';
import CommunityListControls from '@/features/community/components/CommunityListControls';
import CommunityPostList from '@/features/community/components/CommunityPostList';
import { getCommunityPosts, getSubjects } from '@/features/community/server';
import type {
  BoardType,
  PostListItem,
  SubjectItem,
} from '@/features/community/types';
import { TAB_TO_BOARD_TYPE } from '@/features/community/types';

const SORT_MAP: Record<string, string> = {
  최신순: 'latest',
  조회순: 'views',
  댓글순: 'comments',
};

interface CommunityPageProps {
  // Next.js 15+ : searchParams 는 Promise → await 필요
  searchParams: Promise<{
    tab?: string;
    sort?: string;
    keyword?: string;
    page?: string;
    subject?: string;
  }>;
}

// Server Component: 데이터를 서버에서 가져와 렌더한다 (useEffect 없음)
export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  const sp = await searchParams;
  const tab = sp.tab ?? '전체';
  const sort = sp.sort ?? '최신순';
  const keyword = sp.keyword ?? '';
  const pageNum = Number(sp.page ?? '0');

  const boardType = TAB_TO_BOARD_TYPE[tab] ?? 'ALL';
  const apiSort = SORT_MAP[sort] ?? 'latest';
  const subject = sp.subject || undefined;

  const [result, subjectsResult] = await Promise.all([
    getCommunityPosts(
      boardType,
      Number.isNaN(pageNum) ? 0 : pageNum,
      keyword || undefined,
      apiSort,
      subject
    ),
    getSubjects(),
  ]);
  const posts: PostListItem[] =
    result.success && result.data ? result.data.content ?? [] : [];
  const subjects: SubjectItem[] =
    subjectsResult.success && subjectsResult.data ? subjectsResult.data : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-3 flex items-center gap-4">
              <div className="flex h-12 w-12 pl-[2px] justify-center rounded-[20px] bg-[#2F5DAA]">
                <Image
                  src="/icons/commu.svg"
                  alt="community"
                  width={30}
                  height={30}
                />
              </div>
              <h1 className="text-4xl font-bold text-[#1E293B]">커뮤니티</h1>
            </div>
            <p className="text-base text-[#4B5563]">
              함께 성장하는 학습 커뮤니티에 참여하세요
            </p>
          </div>
          <PostActionButtons />
        </div>

        <CommunityListControls
          activeTab={tab}
          sortType={sort}
          keyword={keyword}
          subject={sp.subject ?? ''}
          subjects={subjects}
        />
        <CommunityPostList posts={posts} />
      </div>
    </div>
  );
}
