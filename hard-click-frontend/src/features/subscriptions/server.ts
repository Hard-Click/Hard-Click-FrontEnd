import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import {
  mockSubscriptionStatus,
  SUBSCRIPTION_BENEFITS,
  SUNEUNG_DATE,
  daysUntilSuneung,
  priceOn,
} from '@/mocks/subscriptions.mock';
import type { SubscriptionInfo } from './types';

/**
 * 백엔드 구독 상태 응답(가정) — 격리막.
 * currentPrice·daysUntilSuneung는 BE가 수능 D-day로 계산해 내려주는 값(결제 금액 신뢰성).
 */
interface ApiSubscription {
  subscribed: boolean;
  planName: string;
  benefits: string[];
  suneungDate: string; // YYYY-MM-DD
  daysUntilSuneung: number;
  currentPrice: number;
  paidAt: string | null;
  paidAmount: number | null;
}

function toSubscriptionInfo(api: ApiSubscription): SubscriptionInfo {
  return {
    subscribed: api.subscribed,
    planName: api.planName,
    benefits: api.benefits,
    suneungDate: api.suneungDate,
    daysUntilSuneung: api.daysUntilSuneung,
    currentPrice: api.currentPrice,
    paidAt: api.paidAt,
    paidAmount: api.paidAmount,
  };
}

/** 미구독 기본값(조회 실패 폴백) — 가격 규칙은 도메인 상수로 계산 */
function unsubscribedFallback(): SubscriptionInfo {
  return {
    subscribed: false,
    planName: mockSubscriptionStatus.planName,
    benefits: SUBSCRIPTION_BENEFITS,
    suneungDate: SUNEUNG_DATE,
    daysUntilSuneung: daysUntilSuneung(),
    currentPrice: priceOn(),
    paidAt: null,
    paidAmount: null,
  };
}

/**
 * 본인 구독 상태 조회 (Server Component 전용).
 * 미구독/구독 중을 SubscriptionInfo 하나로 반환.
 * 가격은 수능 D-day 기반(남은 일수 × 1만원) — mock은 여기서 계산, 연동 시 BE의 currentPrice 사용.
 * API 연동 시: 엔드포인트 + ApiSubscription/toSubscriptionInfo만 맞추면 됨.
 */
export async function getSubscriptionServer(): Promise<SubscriptionInfo> {
  if (USE_MOCK) {
    const s = mockSubscriptionStatus;
    return {
      subscribed: s.subscribed,
      planName: s.planName,
      benefits: SUBSCRIPTION_BENEFITS,
      suneungDate: SUNEUNG_DATE,
      daysUntilSuneung: daysUntilSuneung(),
      currentPrice: priceOn(),
      paidAt: s.subscribed ? s.paidAt : null,
      paidAmount: s.subscribed ? s.paidAmount : null,
    };
  }

  // TODO(API 연동): 구독 상태 조회 (currentPrice·daysUntilSuneung는 BE가 수능 D-day로 계산)
  const res = await serverApi.get<ApiSubscription>('/api/subscription/status');
  if (!res.success || !res.data) return unsubscribedFallback();
  return toSubscriptionInfo(res.data);
}
