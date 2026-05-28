'use client';

import Image from 'next/image';

export default function PostEmptyState() {
  return (
    <div className="mt-8 flex h-[280px] flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* icon */}
      <div className="mb-4 flex mb-10 h-16 w-16 items-center justify-center rounded-full">
        <Image src="/icons/commuEmpty.svg" alt="empty" width={64} height={64} />
      </div>

      {/* text */}
      <p className="text-base font-medium text-[#4B5563]">
        등록된 게시글이 없습니다
      </p>
    </div>
  );
}
