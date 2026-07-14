import { render, screen } from '@testing-library/react';
import SubscriptionStatusCard from './SubscriptionStatusCard';
import type { SubscriptionInfo } from '../types';

function makeInfo(overrides: Partial<SubscriptionInfo>): SubscriptionInfo {
  return {
    subscribed: true,
    planName: 'FLOWN 연간 패스',
    benefits: [],
    suneungDate: '2026-11-19',
    daysUntilSuneung: 365,
    currentPrice: 1_580_000,
    paidAt: '2026-07-14',
    paidAmount: 3_840_000,
    expiresAt: '2027-07-14',
    ...overrides,
  };
}

describe('SubscriptionStatusCard — 남은 기간 표시', () => {
  it('남은 일수가 있으면 "N일"로 표시', () => {
    render(<SubscriptionStatusCard info={makeInfo({ daysUntilSuneung: 365 })} />);
    expect(screen.getByText('365일')).toBeInTheDocument();
  });

  it('만료 당일(0)이면 "오늘까지"로 표시 (환불 후 케이스)', () => {
    render(<SubscriptionStatusCard info={makeInfo({ daysUntilSuneung: 0 })} />);
    expect(screen.getByText('오늘까지')).toBeInTheDocument();
    expect(screen.queryByText('0일')).not.toBeInTheDocument();
  });
});
