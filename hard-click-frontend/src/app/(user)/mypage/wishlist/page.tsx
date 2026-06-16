import { getWishlistServer } from '@/features/wishlist/server';
import WishlistClient from '@/features/wishlist/components/WishlistClient';

/**
 * 찜한 강의 페이지 (Server Component) — `/mypage/wishlist`.
 * 강의 상세에서 하트로 찜한 강의 목록. 조회는 서버, 상호작용은 WishlistClient(client 섬).
 */
export default async function WishlistPage() {
  const items = await getWishlistServer();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1280px] px-8 py-12">
        <WishlistClient initialItems={items} />
      </div>
    </div>
  );
}
