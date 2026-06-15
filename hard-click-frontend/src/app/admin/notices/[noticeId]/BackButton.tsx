'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

/** 직전 페이지로 돌아가기 (강의 상세에서 왔으면 강의 상세, 공지 목록에서 왔으면 목록). */
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-6 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-[#4B5563] transition-colors hover:text-[#2F5DAA]"
    >
      <Image src="/icons/back.svg" alt="back" width={16} height={16} />
      목록으로 돌아가기
    </button>
  );
}
