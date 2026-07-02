import { toast as sonner } from 'sonner';

/**
 * sonner `toast` 래퍼 — 같은 문자열 메시지에 같은 id를 부여해, 동일 토스트가 화면에 여러 개
 * 겹쳐 쌓이지 않고 하나로 합쳐지게 한다(전역 중복 제거). 병렬 요청 실패·더블클릭·이중 호출 등으로
 * 같은 문구가 연달아 떠도 하나만 보인다.
 *
 * - 명시적으로 id를 넘긴 호출은 그 id를 존중한다(`...data`가 뒤에 와서 우선).
 * - promise·custom·dismiss·loading 등 원본 메서드는 그대로 노출한다.
 * - 서로 다른 문구는 id가 달라 정상적으로 각각 표시된다(피드백 유실 없음).
 * - 동일 문구가 동시에 성공·실패로 뜨면 뒤엣것이 앞엣것을 갱신한다(가장 최근 결과 반영, 유실 아님).
 *
 * 사용처는 `import { toast } from 'sonner'` 대신 `import { toast } from '@/lib/toast'`.
 */
type ToastData = Parameters<typeof sonner.success>[1];
type ToastId = ReturnType<typeof sonner.success>;

const dedupe = (message: string, data?: ToastData): ToastData => ({
  id: message,
  ...data,
});

export const toast = Object.assign(
  (message: string, data?: ToastData): ToastId =>
    sonner(message, dedupe(message, data)),
  sonner,
  {
    success: (message: string, data?: ToastData): ToastId =>
      sonner.success(message, dedupe(message, data)),
    error: (message: string, data?: ToastData): ToastId =>
      sonner.error(message, dedupe(message, data)),
    warning: (message: string, data?: ToastData): ToastId =>
      sonner.warning(message, dedupe(message, data)),
    info: (message: string, data?: ToastData): ToastId =>
      sonner.info(message, dedupe(message, data)),
    message: (message: string, data?: ToastData): ToastId =>
      sonner.message(message, dedupe(message, data)),
  },
);
