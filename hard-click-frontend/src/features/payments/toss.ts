/**
 * 토스페이먼츠 SDK v1 로더 (client 전용).
 *
 * - 공식 SDK 스크립트(`https://js.tosspayments.com/v1/payment`)를 1회만 주입한다.
 * - ⚠️ 보안: 초기화엔 **클라이언트 키(Client Key)만** 사용한다. 시크릿 키는 절대 프론트/Git에 두지 않는다.
 * - 키는 `NEXT_PUBLIC_TOSS_CLIENT_KEY` 환경변수로 주입한다(없으면 결제 흐름 비활성 → mock 폴백).
 */

/** 토스 결제창 호출 파라미터 (v1 `requestPayment('카드', ...)`) */
export interface TossRequestPaymentParams {
  amount: number;
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerName?: string;
}

interface TossPaymentsInstance {
  requestPayment: (
    method: '카드',
    params: TossRequestPaymentParams,
  ) => Promise<void>;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

const SDK_SRC = 'https://js.tosspayments.com/v1/payment';
let loadPromise: Promise<void> | null = null;

/** SDK 스크립트를 (한 번만) 로드한다. */
function loadSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('토스 SDK는 브라우저에서만 로드할 수 있습니다.'));
  }
  if (window.TossPayments) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('토스 결제 SDK를 불러오지 못했습니다.'));
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}

/** Client Key로 초기화된 TossPayments 인스턴스를 반환한다. */
export async function getTossPayments(
  clientKey: string,
): Promise<TossPaymentsInstance> {
  await loadSdk();
  if (!window.TossPayments) {
    throw new Error('토스 결제 SDK 초기화에 실패했습니다.');
  }
  return window.TossPayments(clientKey);
}

/** 설정된 토스 Client Key (없으면 빈 문자열 → 결제 흐름 비활성). */
export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '';
