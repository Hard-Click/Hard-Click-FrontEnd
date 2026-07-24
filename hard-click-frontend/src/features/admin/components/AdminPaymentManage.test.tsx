import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminPaymentManage from './AdminPaymentManage';
import type { AdminPayment } from '@/features/payment/types';
import { refundPaymentAction } from '@/features/payment/actions';

jest.mock('@/features/payment/actions', () => ({
  refundPaymentAction: jest.fn(),
}));
jest.mock('@/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// 모달을 스텁으로 대체 — onConfirm/pending을 캡처해, 리렌더(=버튼 disabled 반영) 전에 onConfirm을
// 두 번 호출함으로써 disabled가 아니라 동기 refundingRef 가드가 2번째를 막는지 직접 검증한다(토끼 리뷰).
let mockOnConfirm: (() => void) | undefined;
let mockPending: boolean | undefined;
jest.mock('./PaymentRefundModal', () => ({
  __esModule: true,
  default: (props: { onConfirm: () => void; pending?: boolean }) => {
    mockOnConfirm = props.onConfirm;
    mockPending = props.pending;
    return <div data-testid="refund-modal" />;
  },
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

function openModal() {
  render(<AdminPaymentManage payments={[makePayment()]} />);
  fireEvent.click(screen.getByRole('button', { name: '환불' })); // 행의 환불 → 모달 오픈
}

describe('AdminPaymentManage — 환불 중복 제출 방지', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnConfirm = undefined;
    mockPending = undefined;
  });

  it('리렌더 전 확인 핸들러가 두 번 호출돼도 환불 요청은 1회만 나간다(동기 ref 가드)', () => {
    mockRefund.mockReturnValue(new Promise<never>(() => {})); // 진행 중 유지
    openModal();

    // 같은 틱에 두 번 — pending 리렌더(버튼 disabled) 전이므로 refundingRef만이 2번째를 막을 수 있다.
    act(() => {
      mockOnConfirm!();
      mockOnConfirm!();
    });

    expect(mockRefund).toHaveBeenCalledTimes(1);
  });

  it('환불 진행 중에는 모달에 pending=true가 전달된다(버튼 비활성)', () => {
    mockRefund.mockReturnValue(new Promise<never>(() => {}));
    openModal();

    act(() => {
      mockOnConfirm!();
    });

    expect(mockPending).toBe(true);
  });
});
