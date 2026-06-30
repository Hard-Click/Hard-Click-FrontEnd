import { test, expect } from '@playwright/test';

test.describe('로그인 플로우', () => {
  test('관리자 로그인 성공 시나리오', async ({ page }) => {
    // Given: 로그인 페이지 접속
    await page.goto('/auth/login');

    // When: 관리자 계정 정보 입력
    await page.getByPlaceholder('아이디를 입력하세요').fill('demo_admin');
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('Test1234!');
    await page.getByRole('button', { name: '로그인' }).click();

    // Then: 관리자 대시보드로 이동
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('대시보드');
  });

  test('로그인 실패 시나리오 — 잘못된 비밀번호', async ({ page }) => {
    // Given: 로그인 페이지 접속
    await page.goto('/auth/login');

    // When: 잘못된 비밀번호 입력
    await page.getByPlaceholder('아이디를 입력하세요').fill('demo_admin');
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();

    // Then: 에러 메시지 표시, 로그인 페이지 유지
    await expect(page.getByText(/아이디 또는 비밀번호/)).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  test('관리자 로그아웃 후 강의 목록 페이지로 이동', async ({ page }) => {
    // Given: 관리자 로그인
    await page.goto('/auth/login');
    await page.getByPlaceholder('아이디를 입력하세요').fill('demo_admin');
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('Test1234!');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page).toHaveURL('/admin/dashboard');

    // When: 로그아웃 클릭
    await page.getByRole('button', { name: '관리자' }).click();
    await page.getByRole('button', { name: '로그아웃' }).click();

    // Then: /courses 로 이동, 로그인 페이지로 튕기지 않음
    await expect(page).toHaveURL('/courses');
    await expect(page).not.toHaveURL('/auth/login');
  });
});
