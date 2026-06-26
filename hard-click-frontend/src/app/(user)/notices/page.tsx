import GlobalNoticeList from '@/features/notices/components/GlobalNoticeList';
import { getGlobalNoticesServer } from '@/features/notices/server';

interface NoticesPageProps {
  searchParams: Promise<{ keyword?: string; page?: string }>;
}

// Server Component: 검색/페이징을 searchParams로 받아 서버에서 조회 (useEffect 없음)
export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  const sp = await searchParams;
  const keyword = sp.keyword ?? '';
  const page = Math.max(0, Number(sp.page ?? '0') || 0);

  const { notices, totalPages } = await getGlobalNoticesServer({
    page,
    keyword: keyword || undefined,
  });

  return (
    <GlobalNoticeList
      notices={notices}
      totalPages={totalPages}
      page={page}
      keyword={keyword}
      basePath="/notices"
      backHref="/courses"
    />
  );
}
