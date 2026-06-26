'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import AdminPaymentFilterBar from './AdminPaymentFilterBar';
import AdminPaymentTable from './AdminPaymentTable';
import PaymentRefundModal from './PaymentRefundModal';
import Pagination from './Pagination';
import type {
  AdminPayment,
  AdminPaymentTypeFilter,
} from '@/features/payment/types';
import { refundPaymentAction } from '@/features/payment/actions';

const PAGE_SIZE = 10;

interface AdminPaymentManageProps {
  payments: AdminPayment[];
}

export default function AdminPaymentManage({
  payments,
}: AdminPaymentManageProps) {
  const [paymentList, setPaymentList] = useState<AdminPayment[]>(payments);
  const [type, setType] = useState<AdminPaymentTypeFilter>('ALL');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<AdminPayment | null>(null);

  const filteredPayments = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return paymentList.filter((p) => {
      if (type !== 'ALL' && p.paymentType !== type) return false;
      if (q) {
        const haystack =
          `${p.orderNo} ${p.memberName} ${p.memberEmail}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [paymentList, type, keyword]);

  // 필터/검색 변경 시 1페이지로 리셋
  const handleTypeChange = (next: AdminPaymentTypeFilter) => {
    setType(next);
    setPage(1);
  };
  const handleKeywordChange = (next: string) => {
    setKeyword(next);
    setPage(1);
  };

  const handleConfirmRefund = async () => {
    if (!refundTarget) return;
    const result = await refundPaymentAction(refundTarget.paymentId);
    if (!result.success) {
      toast.error(result.message);
      setRefundTarget(null);
      return;
    }
    setPaymentList((prev) =>
      prev.map((p) =>
        p.paymentId === refundTarget.paymentId
          ? { ...p, status: 'REFUNDED', refundable: false }
          : p
      )
    );
    toast.success(result.message);
    setRefundTarget(null);
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
        onRefund={setRefundTarget}
      />

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {refundTarget && (
        <PaymentRefundModal
          payment={refundTarget}
          onCancel={() => setRefundTarget(null)}
          onConfirm={handleConfirmRefund}
        />
      )}
    </div>
  );
}
