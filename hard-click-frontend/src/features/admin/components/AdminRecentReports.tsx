import Link from 'next/link';
import type { AdminRecentReport } from '@/mocks/admin.mock';

export default function AdminRecentReports({
  reports,
}: {
  reports: AdminRecentReport[];
}) {
  const TYPE_STYLE: Record<string, string> = {
    게시글: 'bg-[#EEF2FF] text-[#2F5DAA]',
    댓글: 'bg-[#FFF4E5] text-[#F97316]',
    리뷰: 'bg-[#DCFCE7] text-[#16A34A]',
  };

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1E293B]">최근 신고</h2>
        <Link
          href="/admin/reports"
          className="text-sm text-[#2F5DAA] hover:underline"
        >
          전체보기
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#E2E8F0] p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    TYPE_STYLE[r.type] ?? 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {r.type}
                </span>
                <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#D97706]">
                  {r.status}
                </span>
              </div>
              <span className="text-xs text-[#94A3B8]">{r.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1E293B]">{r.title}</p>
              <Link
                href={`/admin/reports/${r.id}`}
                className="text-xs text-[#2F5DAA] rounded-xl px-2 py-0.5  border border-[#E2E8F0]"
              >
                상세보기
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
