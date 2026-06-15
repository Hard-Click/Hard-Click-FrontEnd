'use client';

import { useMemo, useState } from 'react';
import AdminUserFilterBar from './AdminUserFilterBar';
import type { AdminUser } from '@/features/users/types';
import type {
  AdminUserRoleFilter,
  AdminUserStatusFilter,
} from '@/features/admin/types';
import AdminMemberTable from './AdminMemberTable';

interface AdminUserManageProps {
  users: AdminUser[];
}

export default function AdminUserManage({ users }: AdminUserManageProps) {
  const [role, setRole] = useState<AdminUserRoleFilter>('ALL');
  const [status, setStatus] = useState<AdminUserStatusFilter>('ALL');
  const [keyword, setKeyword] = useState('');

  const filteredUsers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== 'ALL' && u.role !== role) return false;
      if (status !== 'ALL' && u.status !== status) return false;
      if (q) {
        const haystack = `${u.name} ${u.loginId} ${u.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [users, role, status, keyword]);

  return (
    <div className="flex flex-col gap-6">
      <AdminUserFilterBar
        role={role}
        status={status}
        keyword={keyword}
        onRoleChange={setRole}
        onStatusChange={setStatus}
        onKeywordChange={setKeyword}
      />

      {/* 목록 (테이블은 후속 이슈에서 연결) */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-m text-[#64748B]">
        총 {filteredUsers.length}명의 사용자가 있습니다.
      </div>

      <AdminMemberTable users={filteredUsers} />
    </div>
  );
}
