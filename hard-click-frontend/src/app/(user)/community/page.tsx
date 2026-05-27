import Image from 'next/image';
import CommunityFilterTabs from '@/features/community/components/CommunityFilterTabs';
import CommunityToolBar from '@/features/community/components/CommunityToolBar';
import PostActionButtons from '@/features/community/components/PostActionButtons';
import PostEmptyState from '@/features/community/components/PostEmptyState';
import CommunityPostCard from '@/features/community/components/CommunityPostCard';

export default function CommunityPage() {
  const mockPosts: { id: number }[] = [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* top */}
        <div className="mb-8 flex items-start justify-between">
          {/* left */}
          <div>
            <div className="mb-3 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
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

          {/* right */}
          <PostActionButtons />
        </div>

        <CommunityFilterTabs />

        <div className="mt-6">
          <CommunityToolBar />
        </div>
        {mockPosts.length === 0 ? (
          <PostEmptyState />
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {mockPosts.map((post) => (
              <CommunityPostCard key={post.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
