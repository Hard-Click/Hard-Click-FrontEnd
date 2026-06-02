import CommunityWriteForm from '@/features/community/components/CommunityWriteForm';
import Image from 'next/image';

export default function CommunityWritePage() {
  return (
    <div>
      <div className="items-start flex gap-4 px-8 py-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
          <Image
            src="/icons/commu.svg"
            alt="community"
            width={30}
            height={30}
          />
        </div>

        <h1 className="mt-1 text-4xl font-bold text-[#1E293B]">게시글 작성</h1>
      </div>

      <CommunityWriteForm />
    </div>
  );
}
