'use client';

import { useEffect } from 'react';

/**
 * 상세 페이지 진입 시 스크롤을 맨 위로 리셋.
 * 목록에서 스크롤한 채로 넘어오면 이전 스크롤 위치가 유지돼 상단 브레드크럼이 가려지는 문제 방지.
 */
export function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}
