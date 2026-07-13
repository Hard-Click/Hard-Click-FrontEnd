import { test, expect } from '@playwright/test';

/**
 * 스모크 E2E (수업자료 §2-4) — 공개 페이지가 정상 렌더되는지 확인.
 * mock/실서버 무관하게 정적 셸(헤더·히어로·강의 섹션)이 뜨는지 검증.
 * (로그인→수강→학습 등 BE 의존 풀 시나리오는 실연동 환경에서 추가)
 */
test.describe('스모크 — 공개 페이지 렌더', () => {
  test('홈 진입 시 /courses로 리다이렉트되고 헤더·히어로가 렌더된다', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/courses/); // app/page.tsx redirect('/courses')
    await expect(page.getByText('FLOWN')).toBeVisible(); // 공통 헤더 브랜드
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      '1등급을 향한 여정',
    ); // 히어로 h1 (재디자인: '2027 수능'은 h1→D-day 배지로 이동)
    await expect(page.getByText(/2027 수능까지 D-/)).toBeVisible(); // 수능 D-day 배지
  });

  test('강의 목록 페이지에 강의 섹션이 보인다', async ({ page }) => {
    await page.goto('/courses');
    await expect(
      page.getByRole('heading', { name: '강의', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('원하는 강의를 찾아보세요.')).toBeVisible();
  });
});
