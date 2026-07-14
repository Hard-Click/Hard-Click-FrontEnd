import { cache } from 'react';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import {
  mockSubscriptionStatus,
  SUBSCRIPTION_BENEFITS,
  SUNEUNG_DATE,
  daysUntilSuneung,
  priceOn,
} from '@/mocks/subscriptions.mock';
import type { SubscriptionInfo } from './types';
import { subscriptionRemainingDays } from './utils';

/* ─────────────────────────────────────────────────────────────────────────
 * 구독권 — 실서버 연동 (2026-06-25). BE는 me(상태)·plan(가격) 2개로 분리 → 합쳐서 SubscriptionInfo로.
 * ⚠️ 모델 차이: FE는 "수능 D-day 동적가격"이었으나 BE는 "고정 플랜가(plan.price) + 구독 만료(remainingDays)".
 *    → 가격은 BE plan.price(실값) 사용(원래 placeholder였음). 남은기간은 구독 중일 때 만료일(expiredAt)에서
 *    파생(utils.subscriptionRemainingDays) — BE remainingDays는 환불 시 만료일과 어긋나 안 씀.
 * ───────────────────────────────────────────────────────────────────────── */

/** GET /api/subscriptions/me (라이브 검증). */
interface ApiSubscriptionMe {
  subscribed: boolean;
  subscriptionId: number | null;
  planId: number | null;
  paymentMethod: string;
  paidAmount: number;
  startedAt: string | null;
  expiredAt: string | null;
  remainingDays: number;
}

/** GET /api/subscriptions/plan (라이브 검증). */
interface ApiSubscriptionPlan {
  planId: number;
  name: string;
  price: number;
  durationDays: number;
  benefits: string[];
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
    expiresAt: null,
  };
}

/**
 * 본인 구독 상태 조회 (Server Component 전용). 미구독/구독 중을 SubscriptionInfo 하나로 반환.
 * 라이브: GET /api/subscriptions/me(상태) + GET /api/subscriptions/plan(플랜·가격) 병렬 조회 후 합침.
 */
export const getSubscriptionServer = cache(async (): Promise<SubscriptionInfo> => {
  if (isMock('subscriptions')) {
    const s = mockSubscriptionStatus;
    return {
      subscribed: s.subscribed,
      planName: s.planName,
      benefits: SUBSCRIPTION_BENEFITS,
      suneungDate: SUNEUNG_DATE,
      daysUntilSuneung: s.subscribed
        ? subscriptionRemainingDays(s.expiresAt)
        : daysUntilSuneung(),
      currentPrice: priceOn(),
      paidAt: s.subscribed ? s.paidAt : null,
      paidAmount: s.subscribed ? s.paidAmount : null,
      expiresAt: s.subscribed ? s.expiresAt : null,
    };
  }

  const [meRes, planRes] = await Promise.all([
    serverApi.get<ApiSubscriptionMe>('/api/subscriptions/me'),
    serverApi.get<ApiSubscriptionPlan>('/api/subscriptions/plan'),
  ]);
  const me = meRes.success ? meRes.data : null;
  const plan = planRes.success ? planRes.data : null;
  if (!me && !plan) return unsubscribedFallback();

  const subscribed = me?.subscribed ?? false;
  return {
    subscribed,
    planName: plan?.name ?? mockSubscriptionStatus.planName,
    benefits: plan?.benefits ?? SUBSCRIPTION_BENEFITS,
    suneungDate: SUNEUNG_DATE,
    // 구독 중: 남은 기간을 만료일(expiredAt)에서 파생 — BE remainingDays는 환불 시 만료일과 어긋나므로 안 씀
    //   (환불하면 BE가 expiredAt만 당일로 당기고 remainingDays는 원래값을 줘 "만료일=오늘, 남은 365일" 불일치).
    // 미구독: 수능 D-day(표시용, 가격은 plan.price 고정).
    daysUntilSuneung: subscribed
      ? subscriptionRemainingDays(me?.expiredAt)
      : daysUntilSuneung(),
    currentPrice: plan?.price ?? priceOn(),
    paidAt: subscribed && me?.startedAt ? me.startedAt.split('T')[0] : null,
    paidAmount: subscribed ? (me?.paidAmount ?? null) : null,
    // 실 만료일 = BE me.expiredAt(결제일+구독기간). 하드코딩 수능일을 만료일로 쓰던 §0.1② 정정.
    expiresAt: subscribed && me?.expiredAt ? me.expiredAt.split('T')[0] : null,
  };
});
