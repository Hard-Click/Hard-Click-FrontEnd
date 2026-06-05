/**
 * 구독 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/subscription-plans  (data는 배열 직접)
 */

export interface SubscriptionPlanApiItem {
  planId: number;
  planName: string;
  price: number; // 월 구독 가격(원)
  durationDays: number;
  description: string;
  benefits: string[];
}

export const mockSubscriptionPlans: SubscriptionPlanApiItem[] = [
  {
    planId: 1,
    planName: '베이직',
    price: 29900,
    durationDays: 30,
    description: '모든 강의 무제한 수강',
    benefits: ['전 과목 강의 무제한 수강', '모바일 학습 지원'],
  },
  {
    planId: 2,
    planName: '프리미엄',
    price: 49900,
    durationDays: 30,
    description: '베이직 + 1:1 질문 무제한',
    benefits: ['전 과목 강의 무제한 수강', '1:1 질문 무제한', '모의고사 제공'],
  },
];
