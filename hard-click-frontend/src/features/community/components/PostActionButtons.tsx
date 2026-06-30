'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemberStatus } from '@/features/community/MemberStatusProvider';

export default function PostActionButtons() {
  const router = useRouter();
  const { isSuspended } = useMemberStatus();

  if (isSuspended) {
    return (
      <div className="flex mt-5 flex-col items-end gap-1">
        <button
          type="button"
          disabled
          className="flex h-11 items-center gap-2 rounded-xl bg-[#E2E8F0] px-5 text-sm font-semibold text-[#94A3B8] cursor-not-allowed"
        >
          <Image src="/icons/plus.svg" alt="write" width={16} height={16} />
          글쓰기
        </button>
        <p className="text-xs text-[#EF4444]">커뮤니티 작성이 제한된 계정입니다.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={() => router.push('/community/new')}
        className="flex mt-5 h-11 items-center cursor-pointer gap-2 rounded-xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white transition hover:bg-[#244C8F]"
      >
        <Image src="/icons/plus.svg" alt="write" width={16} height={16} />
        글쓰기
      </button>
    </div>
  );
}
