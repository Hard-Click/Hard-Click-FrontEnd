'use client';

import Image from 'next/image';

interface PostActionButtonsProps {
  onWriteClick?: () => void;
}

export default function PostActionButtons({
  onWriteClick,
}: PostActionButtonsProps) {
  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={onWriteClick}
        className="flex mt-5 h-11 items-center gap-2 rounded-xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white transition hover:bg-[#244C8F]"
      >
        <Image src="/icons/plus.svg" alt="write" width={16} height={16} />
        글쓰기
      </button>
    </div>
  );
}
