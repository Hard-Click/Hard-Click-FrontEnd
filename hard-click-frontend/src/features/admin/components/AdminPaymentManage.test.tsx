import { render, screen, fireEvent, within } from '@testing-library/react';
import AdminPaymentManage from './AdminPaymentManage';
import type { AdminPayment } from '@/features/payment/types';
import { refundPaymentAction } from '@/features/payment/actions';

jest.mock('@/features/payment/actions', () => ({
  refundPaymentAction: jest.fn(),
}));
jest.mock('@/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockRefund = refundPaymentAction as jest.Mock;

function makePayment(overrides: Partial<AdminPayment> = {}): AdminPayment {
  return {
    paymentId: 1,
    orderNo: 'ORD-0001',
    paymentType: 'COURSE',
    memberName: '홍길동',
    memberEmail: 'hong@example.com',
    amount: 10_000,
    paymentMethod: '카드',
    status: 'PAID',
    paidAt: '2026-07-24',
    refundable: true,
    ...overrides,
  };
}

describe('AdminPaymentManage — 환불 중복 제출 방지', () => {
  beforeEach(() => jest.clearAllMocks());

  it('환불 확인 버튼을 두 번 눌러도 환불 요청은 1회만 나간다', () => {
    // 진행 중 상태를 유지하도록 resolve되지 않는 promise 반환
    mockRefund.mockReturnValue(new Promise<never>(() => {}));
    render(<AdminPaymentManage payments={[makePayment()]} />);

    // 행의 "환불" → 확인 모달 오픈
    fireEvent.click(screen.getByRole('button', { name: '환불' }));

    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: '환불' });
    fireEvent.click(confirm);
    fireEvent.click(confirm); // 더블클릭

    expect(mockRefund).toHaveBeenCalledTimes(1);
  });

  it('환불 진행 중에는 확인 버튼이 "처리 중…"으로 비활성화된다', () => {
    mockRefund.mockReturnValue(new Promise<never>(() => {}));
    render(<AdminPaymentManage payments={[makePayment()]} />);

    fireEvent.click(screen.getByRole('button', { name: '환불' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '환불' }));

    const pendingBtn = within(dialog).getByRole('button', { name: '처리 중…' });
    expect(pendingBtn).toBeDisabled();
  });
});
