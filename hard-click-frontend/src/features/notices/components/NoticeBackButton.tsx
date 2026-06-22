'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * 공지 상세 '뒤로가기' — Client 잎사귀.
 * 실제 이전 페이지로 돌아간다(강의 상세에서 진입했으면 강의 상세로).
 * 직접 진입 등 히스토리가 없으면 `fallbackHref`로 이동.
 */
export default function NoticeBackButton({
  fallbackHref,
}: {
  fallbackHref: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-6 flex w-fit items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#1E293B]"
    >
      <Image src="/icons/back.svg" alt="" width={16} height={16} />
      뒤로가기
    </button>
  );
}
