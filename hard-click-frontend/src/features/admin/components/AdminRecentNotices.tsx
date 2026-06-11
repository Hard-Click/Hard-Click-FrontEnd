import Link from 'next/link';
import type { AdminRecentNotice } from '@/mocks/admin.mock';

export default function AdminRecentNotices({
  notices,
}: {
  notices: AdminRecentNotice[];
}) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1E293B]">최근 공지</h2>
        <Link
          href="/admin/notices"
          className="text-sm text-[#2F5DAA] hover:underline"
        >
          전체보기
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {notices.map((n) => (
          <div key={n.id} className="rounded-xl border border-[#E2E8F0] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  n.badge === '중요'
                    ? 'bg-[#FEE2E2] text-[#EF4444]'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {n.badge}
              </span>
              <span className="text-xs text-[#94A3B8]">{n.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1E293B]">{n.title}</p>
              <Link
                href={`/admin/notices/${n.id}`}
                className="text-xs text-[#2F5DAA] rounded-xl px-2 py-0.5  border border-[#E2E8F0]"
              >
                수정하기
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
