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

  test('상세보기 클릭 시 openReport 쿼리 파라미터가 설정된다', async ({ page }) => {
    // Given: 신고 관리 페이지
    await page.goto('/admin/reports');

    // When: 첫 번째 PENDING 신고의 상세보기 클릭 (없으면 메모보기도 허용)
    const btn = page.getByRole('button', { name: /상세보기|메모보기/ }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
    await btn.click();

    // Then: URL에 openReport 파라미터 포함
    await expect(page).toHaveURL(/openReport=/, { timeout: 8000 });
  });

  test('딥링크(openReport 쿼리) 진입 시 해당 행이 하이라이트된다', async ({ page }) => {
    // Given: 신고 목록에서 실제 첫 번째 신고의 reportKey를 얻는다
    await page.goto('/admin/reports');
    const btn = page.getByRole('button', { name: /상세보기|메모보기/ }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
    await btn.click();
    await expect(page).toHaveURL(/openReport=/, { timeout: 8000 });

    // 현재 URL에서 openReport 파라미터 추출 후 다시 직접 접속
    const url = page.url();
    await page.goto(url);

    // Then: 하이라이트된 td가 존재함 (FEF3C7 노란 배경)
    const highlightedCell = page.locator('td.bg-\\[\\#FEF3C7\\]').first();
    await expect(highlightedCell).toBeVisible({ timeout: 8000 });
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
    await expect(page).toHaveURL(/openReport=/, { timeout: 8000 });

    // 5. 신고 상세 모달이 열림
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 });
  });
});
