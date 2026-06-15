import Image from 'next/image';
import { getAdminPaymentsServer } from '@/features/payment/server';
import AdminPaymentManage from '@/features/admin/components/AdminPaymentManage';

export default async function AdminPaymentsPage() {
  // 서버에서 결제 내역 확보 (현재 mock — 추후 GET /api/admin/payments 연동)
  const payments = await getAdminPaymentsServer();

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
            <Image
              src="/icons/quickAction4.svg"
              alt="결제 관리"
              width={36}
              height={36}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">결제 관리</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              전체 결제 내역과 구독 현황을 관리하세요.
            </p>
          </div>
        </div>

        {/* 필터 + 목록 (테이블은 후속 이슈에서 연결) */}
        <AdminPaymentManage payments={payments} />
      </div>
    </div>
  );
}
