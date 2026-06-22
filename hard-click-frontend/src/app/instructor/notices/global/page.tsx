import GlobalNoticeList from '@/features/notices/components/GlobalNoticeList';
import { getGlobalNoticesServer } from '@/features/notices/server';

interface InstructorGlobalNoticesPageProps {
  searchParams: Promise<{ keyword?: string; page?: string }>;
}

// 강사 레이아웃(헤더 유지) 하에서 학생과 동일한 전체 공지 목록을 표시한다.
export default async function InstructorGlobalNoticesPage({
  searchParams,
}: InstructorGlobalNoticesPageProps) {
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
      basePath="/instructor/notices/global"
      backHref="/instructor/courses"
    />
  );
}
