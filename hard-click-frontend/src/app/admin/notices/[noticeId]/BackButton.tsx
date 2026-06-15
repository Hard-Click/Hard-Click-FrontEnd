'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

/** 직전 페이지로 돌아가기 (강의 상세에서 왔으면 강의 상세, 공지 목록에서 왔으면 목록).
 *  앱 내 히스토리가 없으면(새 탭/직접 진입) 관리자 공지 목록으로 폴백. */
export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/admin/notices');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-6 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-[#4B5563] transition-colors hover:text-[#2F5DAA]"
    >
      <Image src="/icons/back.svg" alt="back" width={16} height={16} />
      목록으로 돌아가기
    </button>
  );
}
