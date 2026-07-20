import Image from 'next/image';
import { getAdminUsersServer } from '@/features/users/server';
import AdminUserManage from '@/features/admin/components/AdminUserManage';

export default async function AdminUsersPage() {
  // 서버에서 사용자 목록 확보 (GET /api/admin/members, 실연동)
  const users = await getAdminUsersServer();

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
            <Image
              src="/icons/AdminUser.svg"
              alt="사용자 관리"
              width={36}
              height={36}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">사용자 관리</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              사용자 계정과 권한을 관리하세요.
            </p>
          </div>
        </div>

        {/* 필터 + 목록 (테이블은 후속 이슈에서 연결) */}
        <AdminUserManage users={users} />
      </div>
    </div>
  );
}
