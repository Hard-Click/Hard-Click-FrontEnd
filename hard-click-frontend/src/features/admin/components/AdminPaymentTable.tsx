import type { AdminPayment } from '@/features/payment/types';
import type {
  AdminPaymentType,
  AdminPaymentStatus,
} from '@/features/payment/types';

const TYPE_LABEL: Record<AdminPaymentType, string> = {
  COURSE: '강의',
  SUBSCRIPTION: '구독',
};

const TYPE_STYLE: Record<AdminPaymentType, string> = {
  COURSE: 'bg-[#DCFCE7] text-[#16A34A]',
  SUBSCRIPTION: 'bg-[#F3E8FF] text-[#9333EA]',
};

const STATUS_LABEL: Record<AdminPaymentStatus, string> = {
  PAID: '결제 완료',
  REFUNDED: '환불 완료',
  FAILED: '결제 실패',
};

const STATUS_STYLE: Record<AdminPaymentStatus, string> = {
  PAID: 'bg-[#DCFCE7] text-[#16A34A]',
  REFUNDED: 'bg-[#F1F5F9] text-[#64748B]',
  FAILED: 'bg-[#FEE2E2] text-[#DC2626]',
};

interface AdminPaymentTableProps {
  payments: AdminPayment[];
  totalCount: number;
}

export default function AdminPaymentTable({
  payments,
  totalCount,
}: AdminPaymentTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      {/* 헤더 */}
      <div className="border-b border-[#E2E8F0] px-6 py-4">
        <h2 className="text-lg font-bold text-[#1E293B]">
          결제 내역 ({totalCount}건)
        </h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-[#374151]"
            >
              주문번호
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]"
            >
              구분
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-[#374151]"
            >
              사용자
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-[#374151]"
            >
              상품
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]"
            >
              금액
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]"
            >
              결제수단
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]"
            >
              상태
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]"
            >
              일시
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-[#374151]"
            >
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="py-16 text-center text-sm text-[#94A3B8]"
              >
                결제 내역이 없습니다.
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr
                key={payment.paymentId}
                className="border-b border-[#E2E8F0] last:border-none hover:bg-[#F8FAFC]"
              >
                {/* 주문번호 */}
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#1E293B]">
                  {payment.orderNo}
                </td>
                {/* 구분 */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      TYPE_STYLE[payment.type]
                    }`}
                  >
                    {TYPE_LABEL[payment.type]}
                  </span>
                </td>
                {/* 사용자 */}
                <td className="whitespace-nowrap px-6 py-4">
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {payment.userName}
                  </p>
                  <p className="text-xs text-[#94A3B8]">{payment.userEmail}</p>
                </td>
                {/* 상품 */}
                <td className="px-6 py-4 text-sm text-[#475569]">
                  {payment.productName}
                </td>
                {/* 금액 */}
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-[#2F5DAA]">
                  {payment.amount.toLocaleString()}원
                </td>
                {/* 결제수단 */}
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-[#64748B]">
                  {payment.method}
                </td>
                {/* 상태 */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_STYLE[payment.status]
                    }`}
                  >
                    {STATUS_LABEL[payment.status]}
                  </span>
                </td>
                {/* 일시 */}
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-[#64748B]">
                  {payment.paidAt}
                </td>
                {/* 관리 — 환불 버튼 (결제완료만, 동작은 후속 이슈) */}
                <td className="px-6 py-4 text-center">
                  {payment.status === 'PAID' ? (
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-full border border-[#DC2626] px-3 py-1 text-xs font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]"
                    >
                      환불
                    </button>
                  ) : (
                    <span className="text-sm text-[#94A3B8]">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
