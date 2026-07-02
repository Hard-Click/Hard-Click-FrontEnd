'use client';

import { useMemo, useState } from 'react';
import { toast } from '@/lib/toast';
import AdminUserFilterBar from './AdminUserFilterBar';
import AdminMemberTable from './AdminMemberTable';
import MemberStatusChangeModal from './MemberStatusChangeModal';
import Pagination from './Pagination';
import type { AdminUser } from '@/features/users/types';
import { changeUserStatusAction } from '@/features/users/actions';
import type {
  AdminUserRoleFilter,
  AdminUserStatusFilter,
} from '@/features/admin/types';

const PAGE_SIZE = 10;

interface AdminUserManageProps {
  users: AdminUser[];
}

export default function AdminUserManage({ users }: AdminUserManageProps) {
  const [userList, setUserList] = useState<AdminUser[]>(users);
  const [role, setRole] = useState<AdminUserRoleFilter>('ALL');
  const [status, setStatus] = useState<AdminUserStatusFilter>('ALL');
  const [keyword, setKeyword] = useState('');
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return userList.filter((u) => {
      if (role !== 'ALL' && u.role !== role) return false;
      if (status !== 'ALL' && u.status !== status) return false;
      if (q) {
        const haystack = `${u.name} ${u.username} ${u.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [userList, role, status, keyword]);

  // 필터/검색 변경 시 1페이지로 리셋
  const handleRoleChange = (next: AdminUserRoleFilter) => {
    setRole(next);
    setPage(1);
  };
  const handleStatusChange = (next: AdminUserStatusFilter) => {
    setStatus(next);
    setPage(1);
  };
  const handleKeywordChange = (next: string) => {
    setKeyword(next);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleConfirmToggle = async () => {
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const result = await changeUserStatusAction(targetUser.memberId, nextStatus);
    if (!result.success) {
      toast.error(result.message);
      setTargetUser(null);
      return;
    }
    setUserList((prev) =>
      prev.map((u) =>
        u.memberId === targetUser.memberId ? { ...u, status: nextStatus } : u
      )
    );
    toast.success(result.message);
    setTargetUser(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminUserFilterBar
        role={role}
        status={status}
        keyword={keyword}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onKeywordChange={handleKeywordChange}
      />

      {/* 사용자 목록 테이블 */}
      <AdminMemberTable users={pagedUsers} onToggleStatus={setTargetUser} />

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {targetUser && (
        <MemberStatusChangeModal
          user={targetUser}
          onCancel={() => setTargetUser(null)}
          onConfirm={handleConfirmToggle}
        />
      )}
    </div>
  );
}
