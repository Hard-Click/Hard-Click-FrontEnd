import type { AdminUserRole, AdminUserStatus } from '@/features/users/types';

/** 필터 값 (전체 ALL 포함) */
export type AdminUserRoleFilter = AdminUserRole | 'ALL';
export type AdminUserStatusFilter = AdminUserStatus | 'ALL';

export interface AdminRecentReport {
  id: number;
  type: string;
  status: string;
  title: string;
  date: string;
  /** 신고 관리탭 딥링크 키 (`${targetType}-${targetId}`) */
  reportKey: string;
}

export interface AdminRecentNotice {
  id: number;
  badge: string;
  title: string;
  date: string;
}
