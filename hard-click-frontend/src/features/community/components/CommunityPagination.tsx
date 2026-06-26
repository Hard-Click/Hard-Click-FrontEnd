'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/features/admin/components/Pagination';

interface CommunityPaginationProps {
  /** 0-based 현재 페이지 */
  page: number;
  totalPages: number;
}

export default function CommunityPagination({
  page,
  totalPages,
}: CommunityPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Pagination 컴포넌트는 1-based, 커뮤니티 URL ?page=는 0-based
  const handlePageChange = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const zeroBased = next - 1;
    if (zeroBased <= 0) params.delete('page');
    else params.set('page', String(zeroBased));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <Pagination
      currentPage={page + 1}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
