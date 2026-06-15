'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import AdminUserFilterBar from './AdminUserFilterBar';
import AdminMemberTable from './AdminMemberTable';
import MemberStatusChangeModal from './MemberStatusChangeModal';
import type { AdminUser } from '@/features/users/types';
import type {
  AdminUserRoleFilter,
  AdminUserStatusFilter,
} from '@/features/admin/types';

interface AdminUserManageProps {
  users: AdminUser[];
}

export default function AdminUserManage({ users }: AdminUserManageProps) {
  const [userList, setUserList] = useState<AdminUser[]>(users);
  const [role, setRole] = useState<AdminUserRoleFilter>('ALL');
  const [status, setStatus] = useState<AdminUserStatusFilter>('ALL');
  const [keyword, setKeyword] = useState('');
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);

  const filteredUsers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return userList.filter((u) => {
      if (role !== 'ALL' && u.role !== role) return false;
      if (status !== 'ALL' && u.status !== status) return false;
      if (q) {
        const haystack = `${u.name} ${u.loginId} ${u.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [userList, role, status, keyword]);

  const handleConfirmToggle = () => {
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    // TODO: 상태 변경 API 연동 후 성공 시 갱신 (현재 mock — 로컬 상태 토글)
    setUserList((prev) =>
      prev.map((u) =>
        u.memberId === targetUser.memberId ? { ...u, status: nextStatus } : u
      )
    );
    toast.success(
      nextStatus === 'LOCKED'
        ? `${targetUser.name}님의 계정을 잠갔습니다.`
        : `${targetUser.name}님의 계정 잠금을 해제했습니다.`
    );
    setTargetUser(null);
  };

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

      {/* 사용자 목록 테이블 */}
      <AdminMemberTable users={filteredUsers} onToggleStatus={setTargetUser} />

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
