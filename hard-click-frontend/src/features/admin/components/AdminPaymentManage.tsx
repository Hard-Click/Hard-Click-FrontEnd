'use client';

import { useMemo, useState } from 'react';
import AdminPaymentFilterBar from './AdminPaymentFilterBar';
import type {
  AdminPayment,
  AdminPaymentTypeFilter,
} from '@/features/payment/types';

interface AdminPaymentManageProps {
  payments: AdminPayment[];
}

export default function AdminPaymentManage({
  payments,
}: AdminPaymentManageProps) {
  const [type, setType] = useState<AdminPaymentTypeFilter>('ALL');
  const [keyword, setKeyword] = useState('');

  const filteredPayments = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return payments.filter((p) => {
      if (type !== 'ALL' && p.type !== type) return false;
      if (q) {
        const haystack =
          `${p.orderNo} ${p.userName} ${p.userEmail}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [payments, type, keyword]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPaymentFilterBar
        type={type}
        keyword={keyword}
        onTypeChange={setType}
        onKeywordChange={setKeyword}
      />

      {/* 결제 목록 (테이블은 후속 이슈에서 연결) */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B]">
        결제 내역 ({filteredPayments.length}건)
      </div>
    </div>
  );
}
