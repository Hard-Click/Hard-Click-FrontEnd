import { render, screen, within } from '@testing-library/react';
import PaymentHistoryCard from './PaymentHistoryCard';
import type { PaymentHistory, PaymentStatus } from '../types';

/**
 * 결제 내역 카드 통합 테스트 (RTL).
 * 회귀 핵심: STATUS_STYLE에 정의된 status는 한글 라벨로,
 * enum에 없는 미래/미정의 status는 raw 값으로 폴백(크래시 X).
 */

// 테스트용 기본 결제 내역 — 필요한 필드만 override
function makePayment(overrides: Partial<PaymentHistory> = {}): PaymentHistory {
  return {
    paymentId: 1,
    orderId: 100,
    orderNo: 'ORD-20260610-001',
    paymentType: 'COURSE',
    status: 'PAID',
    amount: 49000,
    paidAt: '2026-06-10T14:30:00',
    displayName: '수능 국어 완성',
    ...overrides,
  };
}

describe('PaymentHistoryCard — 결제 내역 카드 렌더', () => {
  it('주문번호·금액·항목(displayName)을 렌더한다', () => {
    render(<PaymentHistoryCard payment={makePayment()} />);

    expect(screen.getByText('ORD-20260610-001')).toBeInTheDocument();
    // amount.toLocaleString() + '원'
    expect(screen.getByText('49,000원')).toBeInTheDocument();
    expect(screen.getByText('• 수능 국어 완성')).toBeInTheDocument();
  });

  it('displayName이 ", "로 연결된 복수 항목이면 불릿으로 분리 렌더한다', () => {
    render(
      <PaymentHistoryCard
        payment={makePayment({ displayName: '국어 완성, 수학 심화, 영어 독해' })}
      />,
    );

    expect(screen.getByText('• 국어 완성')).toBeInTheDocument();
    expect(screen.getByText('• 수학 심화')).toBeInTheDocument();
    expect(screen.getByText('• 영어 독해')).toBeInTheDocument();
    // 주문 항목 ul 내부의 li만 카운트(카드 래퍼 li 제외)
    const itemList = screen.getByRole('list');
    expect(within(itemList).getAllByRole('listitem')).toHaveLength(3);
  });

  it('항목 split 시 빈 토큰(연속 콤마·끝 콤마)은 걸러낸다', () => {
    render(
      <PaymentHistoryCard
        payment={makePayment({ displayName: '국어 완성, , 수학 심화,' })}
      />,
    );

    const itemList = screen.getByRole('list');
    expect(within(itemList).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('• 국어 완성')).toBeInTheDocument();
    expect(screen.getByText('• 수학 심화')).toBeInTheDocument();
  });
});

describe('PaymentHistoryCard — 상태 라벨 (회귀)', () => {
  // STATUS_STYLE에 정의된 status → 한글 라벨 매핑
  const KNOWN: Array<[PaymentStatus, string]> = [
    ['PAID', '완료'],
    ['REFUNDED', '환불완료'],
    ['FAILED', '실패'],
    ['READY', '결제 대기'],
    ['CANCELED', '취소'],
  ];

  it.each(KNOWN)('정의된 status %s는 한글 라벨 "%s"로 표시한다', (status, label) => {
    render(<PaymentHistoryCard payment={makePayment({ status })} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('미정의 status(미래 enum 값)는 raw 값을 라벨로 폴백한다 (크래시 X)', () => {
    // 타입엔 없지만 라이브가 줄 수 있는 미래 값 — 캐스팅으로 강제
    const future = 'PARTIAL_REFUND' as PaymentStatus;
    expect(() =>
      render(<PaymentHistoryCard payment={makePayment({ status: future })} />),
    ).not.toThrow();
    expect(screen.getByText('PARTIAL_REFUND')).toBeInTheDocument();
  });

  it("status가 빈 값이면 '알 수 없음'으로 폴백한다", () => {
    // STATUS_STYLE[''] === undefined → label: payment.status ?? '알 수 없음'
    // 빈 문자열은 ?? 통과(falsy지만 nullish 아님) → 빈 라벨이 되므로,
    // null/undefined 케이스를 확인 (라이브가 status 누락 시)
    const missing = undefined as unknown as PaymentStatus;
    expect(() =>
      render(<PaymentHistoryCard payment={makePayment({ status: missing })} />),
    ).not.toThrow();
    expect(screen.getByText('알 수 없음')).toBeInTheDocument();
  });
});

describe('PaymentHistoryCard — 폴백 값 (null 안전)', () => {
  it('orderNo가 null이면 "주문번호 없음"으로 표시한다', () => {
    render(<PaymentHistoryCard payment={makePayment({ orderNo: null })} />);
    expect(screen.getByText('주문번호 없음')).toBeInTheDocument();
  });

  it('paidAt이 null이면 "-"로 표시한다 (실패/삭제 행)', () => {
    render(<PaymentHistoryCard payment={makePayment({ paidAt: null })} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('paidAt ISO를 "YYYY.MM.DD HH:mm" 형식으로 포맷한다', () => {
    render(
      <PaymentHistoryCard
        payment={makePayment({ paidAt: '2026-06-10T14:30:00' })}
      />,
    );
    expect(screen.getByText('2026.06.10 14:30')).toBeInTheDocument();
  });

  it('금액 0원도 정상 렌더한다 (경계값)', () => {
    render(<PaymentHistoryCard payment={makePayment({ amount: 0 })} />);
    expect(screen.getByText('0원')).toBeInTheDocument();
  });

  it('큰 금액은 천 단위 콤마로 표시한다', () => {
    render(<PaymentHistoryCard payment={makePayment({ amount: 1580000 })} />);
    expect(screen.getByText('1,580,000원')).toBeInTheDocument();
  });
});

describe('PaymentHistoryCard — 상세 이동 링크', () => {
  it('orderId가 있으면 /orders/{orderId} 링크로 감싼다', () => {
    render(<PaymentHistoryCard payment={makePayment({ orderId: 100 })} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/orders/100');
  });

  it('orderId가 null이면 링크가 아닌 비클릭 카드로 렌더한다 (삭제된 강의)', () => {
    render(<PaymentHistoryCard payment={makePayment({ orderId: null })} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    // 본문은 여전히 렌더됨
    expect(screen.getByText('수능 국어 완성', { exact: false })).toBeInTheDocument();
  });
});
