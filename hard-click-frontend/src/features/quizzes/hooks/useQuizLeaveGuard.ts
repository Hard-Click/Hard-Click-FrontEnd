'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 퀴즈 응시 중 이탈 방지 가드 (일반·유사 퀴즈 공용).
 *
 * `active === true` 동안:
 *  - **beforeunload**: 새로고침·탭 닫기·외부 주소 이동 시 브라우저 기본 경고를 띄운다.
 *  - **popstate(뒤로가기)**: 진입 시 더미 히스토리 엔트리를 1개 쌓아, 뒤로가기가 이 엔트리를 먼저
 *    소비하게 한다. 뒤로가기 시도가 감지되면 다시 현재 URL로 밀어 페이지를 유지하고 `showConfirm`을 켠다.
 *  (헤더 링크 이탈은 layout에서 응시 페이지 헤더를 숨겨 원천 차단 — 이 훅은 그 외 경로 담당.)
 *
 * 반환:
 *  - `showConfirm`: 뒤로가기로 뜬 확인 모달 표시 여부.
 *  - `requestStay()`: 모달 닫고 계속 풀기(현재 페이지 유지).
 *  - `confirmLeave()`: 가드를 해제한다. 호출부는 이어서 원하는 목적지로 이동(router.push)하면 된다.
 *
 * ⚠️ 제출 완료 등으로 이탈이 의도된 경우, 호출부에서 `active`를 false로 내리거나 `confirmLeave()`를
 *    먼저 불러 가드를 풀어야 이동이 막히지 않는다(제출 후 리다이렉트 차단 방지).
 */
export function useQuizLeaveGuard(active: boolean): {
  showConfirm: boolean;
  requestStay: () => void;
  confirmLeave: () => void;
} {
  const [showConfirm, setShowConfirm] = useState(false);
  // 확인 후 실제 이탈 중이면 가드를 통과시킨다(popstate/beforeunload 무력화).
  const releasedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    releasedRef.current = false;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (releasedRef.current) return;
      e.preventDefault();
      e.returnValue = ''; // 크롬: 값이 있어야 기본 경고가 뜬다
    };

    const onPopState = () => {
      if (releasedRef.current) return; // 확인 후 이탈 중 → 통과
      // 뒤로가기 시도 → 다시 현재 URL로 밀어 페이지 유지 + 확인 모달
      window.history.pushState(null, '', window.location.href);
      setShowConfirm(true);
    };

    // 뒤로가기 가드용 더미 엔트리(현재 URL) 1개
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('popstate', onPopState);
    };
  }, [active]);

  const requestStay = useCallback(() => setShowConfirm(false), []);
  const confirmLeave = useCallback(() => {
    releasedRef.current = true; // 이후 popstate/beforeunload 통과 → 호출부가 이동
    setShowConfirm(false);
  }, []);

  return { showConfirm, requestStay, confirmLeave };
}
