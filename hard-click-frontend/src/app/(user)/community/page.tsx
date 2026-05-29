'use client';

import Image from 'next/image';
import CommunityFilterTabs from '@/features/community/components/CommunityFilterTabs';
import PostActionButtons from '@/features/community/components/PostActionButtons';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <div className="mb-8 flex items-start justify-between">
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
          <PostActionButtons />
        </div>

        <CommunityFilterTabs />
      </div>
    </div>
  );
}
