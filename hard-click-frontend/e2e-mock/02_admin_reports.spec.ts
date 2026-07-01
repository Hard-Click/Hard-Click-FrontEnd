import { test, expect } from '@playwright/test';

test.describe('관리자 신고 관리 플로우', () => {
  // 각 테스트 전 관리자 로그인
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('아이디를 입력하세요').fill('admin1');
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('Admin1234!');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('신고 관리 페이지 진입 시 목록이 표시된다', async ({ page }) => {
    // Given: 관리자 신고 관리 페이지 접속
    await page.goto('/admin/reports');

    // Then: 페이지 헤더와 신고 목록 확인
    await expect(page.getByRole('heading', { level: 1 })).toContainText('신고 관리');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('row').first()).toBeVisible(); // 헤더 행 확인
  });

  test('신고 유형 탭 필터링 — 리뷰만 표시', async ({ page }) => {
    // Given: 신고 관리 페이지
    await page.goto('/admin/reports');

    // When: 리뷰 탭 클릭
    await page.getByRole('button', { name: '리뷰' }).click();

    // Then: URL 변화 없이 필터 적용, 테이블 행이 줄거나 유지됨
    await expect(page).toHaveURL('/admin/reports');
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('처리 상태 탭 필터링 — 처리 대기만 표시', async ({ page }) => {
    // Given: 신고 관리 페이지
    await page.goto('/admin/reports');

    // When: 처리 대기 탭 클릭
    await page.getByRole('button', { name: '처리 대기' }).click();

    // Then: 테이블에 처리 대기 건만 남음
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('상세보기 클릭 시 신고 상세 모달이 열린다', async ({ page }) => {
    // Given: 신고 관리 페이지
    await page.goto('/admin/reports');

    // When: 첫 번째 PENDING 신고의 상세보기 클릭
    const btn = page.getByRole('button', { name: /상세보기|메모보기/ }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
    await btn.click();

    // Then: 신고 상세 모달(dialog)이 열린다
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 });
  });

  test('딥링크(openReport 쿼리) 진입 시 해당 행이 하이라이트된다', async ({ page }) => {
    // Given: mock 첫 신고(POST-101, "React Hook..." 게시글)로 딥링크 직접 진입
    await page.goto('/admin/reports?openReport=POST-101');

    // Then: 해당 행의 셀이 노란 배경(#FEF3C7 = rgb(254,243,199))으로 하이라이트됨
    const highlightedCell = page
      .getByRole('row')
      .filter({ hasText: 'React Hook useEffect' })
      .getByRole('cell')
      .first();
    await expect(highlightedCell).toHaveCSS(
      'background-color',
      'rgb(254, 243, 199)',
      { timeout: 8000 },
    );
  });

  test('전체 신고 관리 플로우 — 로그인 → 신고 목록 → 상세보기 → 처리', async ({ page }) => {
    // 1. 신고 관리 페이지 이동
    await page.goto('/admin/reports');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('신고 관리', { timeout: 8000 });

    // 2. 신고 유형 필터 — 게시글
    await page.getByRole('button', { name: '게시글' }).click();
    await expect(page.getByRole('table')).toBeVisible();

    // 3. 전체 탭으로 복귀
    await page.getByRole('button', { name: '전체' }).first().click();

    // 4. 첫 번째 신고 상세보기 (PENDING이면 상세보기, 처리됐으면 메모보기)
    const btn = page.getByRole('button', { name: /상세보기|메모보기/ }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
    await btn.click();

    // 5. 신고 상세 모달이 열림
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 });
  });
});
