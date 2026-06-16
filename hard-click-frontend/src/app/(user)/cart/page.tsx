import Image from 'next/image';
import { getCartServer } from '@/features/cart/server';
import CartClient from '@/features/cart/components/CartClient';
import BackButton from '@/components/common/BackButton';

/**
 * 장바구니 페이지 (Server Component) — `/cart`.
 * 프로필 드롭다운·강의 상세 "장바구니 담기"로 진입. 담은 강의 선택·삭제·결제.
 */
export default async function CartPage() {
  const cart = await getCartServer();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1080px] px-8 py-12">
        {/* 이전으로 돌아가기 (앱 공통 형식) */}
        <BackButton
          ariaLabel="이전으로 돌아가기"
          className="inline-flex items-center gap-1.5 text-base font-semibold text-[#4B5563] transition hover:text-[#1F2937]"
        >
          <Image src="/icons/arrowLeftIcon.svg" alt="" width={20} height={20} /> 이전으로
          돌아가기
        </BackButton>
        <h1 className="mt-5 text-[28px] font-bold text-[#1F2937]">장바구니</h1>

        <div className="mt-6">
          <CartClient cart={cart} />
        </div>
      </div>
    </div>
  );
}
