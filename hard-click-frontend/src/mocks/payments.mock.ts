/**
 * 결제 도메인 목 데이터 — 실제 백엔드 코드(Hard-Click-BackEnd) DTO 기준.
 * GET /api/payment/me  (※ 단수 'payment')
 *   → MyPaymentHistoryPageResponse { content[], page, size, totalElements, totalPages, last }
 *   item: MyPaymentHistoryResponse
 *
 * ⚠️ 노션 명세(/api/payments/me, paidAmount/paymentMethod)와 다름 — 실제 코드 기준으로 정렬함.
 */

export type PaymentType = 'COURSE' | 'SUBSCRIPTION';
export type PaymentStatus =
  | 'PAID'
  | 'REFUNDED'
  | 'READY'
  | 'FAILED'
  | 'CANCELED'
  | 'CANCELLED';

export interface MyPaymentHistoryItem {
  paymentId: number;
  orderId: number;
  orderNo: string;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  paidAt: string; // LocalDateTime
  displayName: string; // 강의명 또는 구독 플랜명
}

export interface MyPaymentHistoryPageResponse {
  content: MyPaymentHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const mockMyPayments: MyPaymentHistoryPageResponse = {
  content: [
    {
      paymentId: 3005,
      orderId: 2005,
      orderNo: 'ORD-20260610-001',
      paymentType: 'COURSE',
      amount: 99000,
      status: 'PAID',
      paidAt: '2026-06-10T14:30:00',
      displayName: '2026 수능 국어 완성반',
    },
    {
      paymentId: 3003,
      orderId: 2003,
      orderNo: 'ORD-20260609-002',
      paymentType: 'COURSE',
      amount: 188000,
      status: 'PAID',
      paidAt: '2026-06-09T14:00:00',
      displayName: '2026 수능 국어 완성반, 2026 수능 수학 개념완성',
    },
    {
      paymentId: 3004,
      orderId: 2004,
      orderNo: 'SUB-20260520-001',
      paymentType: 'SUBSCRIPTION',
      amount: 1830000,
      status: 'PAID',
      paidAt: '2026-05-20T09:00:00',
      displayName: 'FLOWN 연간 패스',
    },
    {
      paymentId: 3002,
      orderId: 2002,
      orderNo: 'ORD-20260428-003',
      paymentType: 'COURSE',
      amount: 89000,
      status: 'REFUNDED',
      paidAt: '2026-04-28T16:45:00',
      displayName: '2026 수능 수학 개념완성',
    },
    {
      paymentId: 3001,
      orderId: 2001,
      orderNo: 'ORD-20260415-004',
      paymentType: 'COURSE',
      amount: 119000,
      status: 'FAILED',
      paidAt: '2026-04-15T11:20:00',
      displayName: '2026 수능 영어 독해완성',
    },
    {
      paymentId: 3000,
      orderId: 2006,
      orderNo: 'SUB-20250610-001',
      paymentType: 'SUBSCRIPTION',
      amount: 1500000,
      status: 'PAID',
      paidAt: '2025-06-10T10:00:00',
      displayName: 'FLOWN 연간 패스',
    },
  ],
  page: 0,
  size: 10,
  totalElements: 6,
  totalPages: 1,
  last: true,
};

/* ── 주문 상세 ──
 * ⚠️ BE 미구현(README: payment은 /api/payment/me 목록만). Figma 기준 가정 shape.
 *    연동 시 GET /api/order/{orderId}(또는 /api/payment/{id})로 교체.
 *    환불 가능 여부는 항목(강의)별 — 진도율은 강의마다 다르므로 per-item refundable.
 */
export interface ApiOrderDetailItem {
  courseId: number;
  title: string;
  instructor: string;
  price: number;
  isSubscription: boolean;
  enrollStatus: string;
  /** 이 항목 환불 가능 여부(7일 이내 + 진도율 10% 미만 / 구독 미만료) */
  refundable: boolean;
  refundAmount: number;
  refundNote: string;
}

export interface ApiOrderDetail {
  orderId: number;
  orderNo: string;
  status: 'PAID' | 'REFUNDED' | 'FAILED';
  paymentType: PaymentType;
  orderedAt: string;
  paidAt: string;
  paymentMethod: string;
  items: ApiOrderDetailItem[];
  totalAmount: number;
  refundConditionNote: string;
}

export const mockOrderDetails: ApiOrderDetail[] = [
  // 단건 1개 · 전부 환불 가능
  {
    orderId: 2005,
    orderNo: 'ORD-20260610-001',
    status: 'PAID',
    paymentType: 'COURSE',
    orderedAt: '2026-06-10T14:27:00',
    paidAt: '2026-06-10T14:30:00',
    paymentMethod: '신용카드',
    items: [
      {
        courseId: 1,
        title: '2026 수능 국어 완성반',
        instructor: '김강사',
        price: 99000,
        isSubscription: false,
        enrollStatus: '수강중',
        refundable: true,
        refundAmount: 99000,
        refundNote: '진도율 4% · 결제 5일 경과',
      },
    ],
    totalAmount: 99000,
    refundConditionNote: '결제 후 7일 이내, 강의 진도율 10% 미만',
  },
  // 단건 2개 · 혼합(국어=가능 / 수학=진도율 초과로 불가) → 부분 환불 데모
  {
    orderId: 2003,
    orderNo: 'ORD-20260609-002',
    status: 'PAID',
    paymentType: 'COURSE',
    orderedAt: '2026-06-09T13:57:00',
    paidAt: '2026-06-09T14:00:00',
    paymentMethod: '카카오페이',
    items: [
      {
        courseId: 1,
        title: '2026 수능 국어 완성반',
        instructor: '김강사',
        price: 99000,
        isSubscription: false,
        enrollStatus: '수강중',
        refundable: true,
        refundAmount: 99000,
        refundNote: '진도율 5% · 결제 6일 경과',
      },
      {
        courseId: 3,
        title: '2026 수능 수학 개념완성',
        instructor: '박강사',
        price: 89000,
        isSubscription: false,
        enrollStatus: '수강중',
        refundable: false,
        refundAmount: 0,
        refundNote: '진도율 42% · 10% 초과',
      },
    ],
    totalAmount: 188000,
    refundConditionNote: '결제 후 7일 이내, 강의 진도율 10% 미만',
  },
  // 구독 · 환불 가능(남은 기간 비례)
  {
    orderId: 2004,
    orderNo: 'SUB-20260520-001',
    status: 'PAID',
    paymentType: 'SUBSCRIPTION',
    orderedAt: '2026-05-20T08:57:00',
    paidAt: '2026-05-20T09:00:00',
    paymentMethod: '토스페이',
    items: [
      {
        courseId: 0,
        title: 'FLOWN 연간 패스',
        instructor: '',
        price: 1830000,
        isSubscription: true,
        enrollStatus: '이용중',
        refundable: true,
        refundAmount: 1570000,
        refundNote: '남은 157일 비례 환불',
      },
    ],
    totalAmount: 1830000,
    refundConditionNote: '구독은 남은 이용 기간만큼 비례 환불',
  },
  // 환불 완료
  {
    orderId: 2002,
    orderNo: 'ORD-20260428-003',
    status: 'REFUNDED',
    paymentType: 'COURSE',
    orderedAt: '2026-04-28T16:42:00',
    paidAt: '2026-04-28T16:45:00',
    paymentMethod: '신용카드',
    items: [
      {
        courseId: 3,
        title: '2026 수능 수학 개념완성',
        instructor: '박강사',
        price: 89000,
        isSubscription: false,
        enrollStatus: '수강취소',
        refundable: false,
        refundAmount: 0,
        refundNote: '',
      },
    ],
    totalAmount: 89000,
    refundConditionNote: '',
  },
  // 결제 실패
  {
    orderId: 2001,
    orderNo: 'ORD-20260415-004',
    status: 'FAILED',
    paymentType: 'COURSE',
    orderedAt: '2026-04-15T11:17:00',
    paidAt: '2026-04-15T11:20:00',
    paymentMethod: '신용카드',
    items: [
      {
        courseId: 5,
        title: '2026 수능 영어 독해완성',
        instructor: '최강사',
        price: 119000,
        isSubscription: false,
        enrollStatus: '-',
        refundable: false,
        refundAmount: 0,
        refundNote: '',
      },
    ],
    totalAmount: 119000,
    refundConditionNote: '',
  },
  // 구독 · 만료로 환불 불가(단일 항목 비활성)
  {
    orderId: 2006,
    orderNo: 'SUB-20250610-001',
    status: 'PAID',
    paymentType: 'SUBSCRIPTION',
    orderedAt: '2025-06-10T09:57:00',
    paidAt: '2025-06-10T10:00:00',
    paymentMethod: '계좌이체',
    items: [
      {
        courseId: 0,
        title: 'FLOWN 연간 패스',
        instructor: '',
        price: 1500000,
        isSubscription: true,
        enrollStatus: '이용 만료',
        refundable: false,
        refundAmount: 0,
        refundNote: '이용 기간 만료',
      },
    ],
    totalAmount: 1500000,
    refundConditionNote: '구독은 남은 이용 기간만큼 비례 환불',
  },
];
