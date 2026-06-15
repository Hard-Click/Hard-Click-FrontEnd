import Image from 'next/image';
import type { AdminUser } from '@/features/users/types';
import type { AdminUserRole, AdminUserStatus } from '@/features/users/types';

const ROLE_LABEL: Record<AdminUserRole, string> = {
  STUDENT: '수강생',
  INSTRUCTOR: '강사',
};

const ROLE_STYLE: Record<AdminUserRole, string> = {
  STUDENT: 'bg-[#EEF2FF] text-[#2F5DAA]',
  INSTRUCTOR: 'bg-[#FFF4E5] text-[#F97316]',
};

const STATUS_LABEL: Record<AdminUserStatus, string> = {
  ACTIVE: '활성',
  LOCKED: '잠김',
};

const STATUS_STYLE: Record<AdminUserStatus, string> = {
  ACTIVE: 'bg-[#DCFCE7] text-[#16A34A]',
  LOCKED: 'bg-[#FEE2E2] text-[#DC2626]',
};

interface AdminMemberTableProps {
  users: AdminUser[];
  onToggleStatus: (user: AdminUser) => void;
}

export default function AdminMemberTable({
  users,
  onToggleStatus,
}: AdminMemberTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-[#374151]">
              이름
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-[#374151]">
              아이디
            </th>
            <th className="whitespace-nowrap py-4 pl-2 pr-6 text-center text-sm font-semibold text-[#374151]">
              이메일
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              역할
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              계정 상태
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              가입일
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              최근 로그인
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              누적 신고수
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="py-16 text-center text-sm text-[#94A3B8]"
              >
                해당하는 사용자가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.memberId}
                className="border-b border-[#E2E8F0] last:border-none hover:bg-[#F8FAFC]"
              >
                {/* 이름 */}
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-[#1E293B]">
                  {user.name}
                </td>
                {/* 아이디 */}
                <td className="whitespace-nowrap px-6 py-4 text-sm text-[#64748B]">
                  {user.loginId}
                </td>
                {/* 이메일 */}
                <td className="whitespace-nowrap py-4 pl-2 pr-6 text-sm text-center text-[#64748B]">
                  {user.email}
                </td>
                {/* 역할 */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      ROLE_STYLE[user.role]
                    }`}
                  >
                    {ROLE_LABEL[user.role]}
                  </span>
                </td>
                {/* 계정 상태 */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_STYLE[user.status]
                    }`}
                  >
                    {STATUS_LABEL[user.status]}
                  </span>
                </td>
                {/* 가입일 */}
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-[#64748B]">
                  {user.joinedAt}
                </td>
                {/* 최근 로그인 */}
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-[#64748B]">
                  {user.lastLoginAt ?? '-'}
                </td>
                {/* 누적 신고수 */}
                <td className="px-6 py-4 text-center">
                  {user.reportCount > 0 ? (
                    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#EF4444]/10 px-3 py-1 text-xs font-semibold text-[#EF4444]">
                      {user.reportCount}회
                    </span>
                  ) : (
                    <span className="text-sm text-[#94A3B8]">-</span>
                  )}
                </td>
                {/* 관리 — 잠금/해제 버튼 (동작은 후속 이슈) */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(user)}
                      aria-label={
                        user.status === 'ACTIVE' ? '계정 잠금' : '잠금 해제'
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F1F5F9]"
                    >
                      <Image
                        src={
                          user.status === 'ACTIVE'
                            ? '/icons/OrangeLock.svg'
                            : '/icons/AdminActive.svg'
                        }
                        alt=""
                        width={36}
                        height={36}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
