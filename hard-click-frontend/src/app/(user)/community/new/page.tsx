import CommunityWriteForm from '@/features/community/components/CommunityWriteForm';
import SuspendedWriteGuard from '@/features/community/components/SuspendedWriteGuard';
import { getSubjects } from '@/features/community/server';
import type { SubjectItem } from '@/features/community/types';
import Image from 'next/image';

// Server Component: 과목 목록을 서버에서 조회해 폼에 props로 전달 (useEffect 페칭 X)
export default async function CommunityWritePage() {
  const subjectsRes = await getSubjects();
  const subjects: SubjectItem[] =
    subjectsRes.success && subjectsRes.data ? subjectsRes.data : [];

  return (
    <div>
      <div className="items-start flex gap-4 px-8 py-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
          <Image
            src="/icons/commu.svg"
            alt="community"
            width={30}
            height={30}
          />
        </div>

        <h1 className="mt-1 text-4xl font-bold text-[#1E293B]">게시글 작성</h1>
      </div>

      <SuspendedWriteGuard>
        <CommunityWriteForm subjects={subjects} />
      </SuspendedWriteGuard>
    </div>
  );
}
