'use client';

import { useMemo, useState } from 'react';
import AdminPaymentFilterBar from './AdminPaymentFilterBar';
import AdminPaymentTable from './AdminPaymentTable';
import Pagination from './Pagination';
import type {
  AdminPayment,
  AdminPaymentTypeFilter,
} from '@/features/payment/types';

const PAGE_SIZE = 10;

interface AdminPaymentManageProps {
  payments: AdminPayment[];
}

export default function AdminPaymentManage({
  payments,
}: AdminPaymentManageProps) {
  const [type, setType] = useState<AdminPaymentTypeFilter>('ALL');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

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

  // 필터/검색 변경 시 1페이지로 리셋
  const handleTypeChange = (next: AdminPaymentTypeFilter) => {
    setType(next);
    setPage(1);
  };
  const handleKeywordChange = (next: string) => {
    setKeyword(next);
    setPage(1);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE)
  );
  const safePage = Math.min(page, totalPages);
  const pagedPayments = filteredPayments.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPaymentFilterBar
        type={type}
        keyword={keyword}
        onTypeChange={handleTypeChange}
        onKeywordChange={handleKeywordChange}
      />

      <AdminPaymentTable
        payments={pagedPayments}
        totalCount={filteredPayments.length}
      />

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
