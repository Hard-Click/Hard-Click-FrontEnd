'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PostActionButtonsProps {
  onWriteClick?: () => void;
}

export default function PostActionButtons({
  onWriteClick,
}: PostActionButtonsProps) {
  const router = useRouter();
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
