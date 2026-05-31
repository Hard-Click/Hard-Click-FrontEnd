'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

interface PaymentHistory {
  paymentId: number;
  orderId: number;
  orderNo: string;
  paymentType: 'FREE' | 'PAID';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paidAt: string;
  displayName: string;
}

interface PaymentPageResponse {
  content: PaymentHistory[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '처리중',
  COMPLETED: '결제완료',
  FAILED: '결제실패',
  REFUNDED: '환불완료',
  CANCELLED: '취소',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-[#F97316] bg-[#FFF7ED]',
  COMPLETED: 'text-[#16A34A] bg-[#F0FDF4]',
  FAILED: 'text-[#DC2626] bg-[#FEF2F2]',
  REFUNDED: 'text-[#6B7280] bg-[#F3F4F6]',
  CANCELLED: 'text-[#6B7280] bg-[#F3F4F6]',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PaymentPageResponse>('/api/payment/me?page=0&size=50').then((res) => {
      if (res.success && res.data) {
        setPayments(res.data.content);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-8 pt-9 pb-32">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-6 h-6 flex items-center justify-center text-[#4B5563] hover:text-[#1F2937]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 className="text-[30px] font-bold text-[#1F2937]">결제 내역</h1>
            <p className="text-base text-[#4B5563] mt-1">수강 결제 내역을 확인하세요.</p>
          </div>
        </div>

        {/* 목록 */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] p-[33px]">
          {loading ? (
            <p className="text-center text-[#9CA3AF] py-16">불러오는 중...</p>
          ) : payments.length === 0 ? (
            <p className="text-center text-[#9CA3AF] py-16">결제 내역이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {payments.map((p) => (
                <div key={p.paymentId} className="flex items-center justify-between border border-[#E2E8F0] rounded-xl px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-[#1F2937]">{p.displayName}</span>
                    <span className="text-sm text-[#6B7280]">{p.orderNo} · {formatDate(p.paidAt)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[p.status] ?? 'text-[#6B7280] bg-[#F3F4F6]'}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                    <span className="text-base font-bold text-[#2F5DAA]">
                      {p.paymentType === 'FREE' ? '무료' : `${p.amount.toLocaleString()}원`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
