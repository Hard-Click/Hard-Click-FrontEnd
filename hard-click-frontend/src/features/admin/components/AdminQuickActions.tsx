import AdminQuickActionCard from './AdminQuickActionCard';

const QUICK_ACTIONS = [
  {
    title: '전체 공지 작성',
    desc: '공지 관리',
    icon: '/icons/plus.svg',
    href: '/admin/notices',
  },
  {
    title: '신고 관리',
    desc: '신고 처리',
    icon: '/icons/quickAction1.svg',
    href: '/admin/reports',
  },
  {
    title: '강의 상태 관리',
    desc: '강의 승인/승급',
    icon: '/icons/quickAction2.svg',
    href: '/admin/courses',
  },
  {
    title: '사용자 관리',
    desc: '계정 관리',
    icon: '/icons/quickAction3.svg',
    href: '/admin/users',
  },
  {
    title: '결제 관리',
    desc: '결제/환불 처리',
    icon: '/icons/quickAction4.svg',
    href: '/admin/payments',
  },
  {
    title: '퀴즈 관리',
    desc: '퀴즈 수정/삭제',
    icon: '/icons/quickAction5.svg',
    href: '/admin/quizzes',
  },
];

export default function AdminQuickActions() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-[#1E293B]">빠른 관리</h2>
      <div className="grid grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((a) => (
          <AdminQuickActionCard key={a.title} {...a} />
        ))}
      </div>
    </div>
  );
}
