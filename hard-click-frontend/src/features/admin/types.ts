import type { AdminUserRole, AdminUserStatus } from '@/features/users/types';

/** 필터 값 (전체 ALL 포함) */
export type AdminUserRoleFilter = AdminUserRole | 'ALL';
export type AdminUserStatusFilter = AdminUserStatus | 'ALL';
