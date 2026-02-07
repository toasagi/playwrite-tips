import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 比較用：Hooksを使った場合のテスト
 */

const BASE_URL = 'https://toasagi.github.io/shoptodo-app';

// ユーザーデータの型定義
type UserData = {
  username: string;
  login: {
    username: string;
    password: string;
  };
  profile: {
    displayName: string;
    phone: string;
    paymentMethod: string;
  };
};

// 全テストで共有する変数（暗黙的な依存関係）
let yamadaData: UserData;
let satoData: UserData;
let tanakaData: UserData;

// ユーザーデータを読み込む関数
function loadUserData(username: string): UserData {
  const filePath = path.join(__dirname, '..', 'test-data', `${username}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// ログインしてプロフィールデータを入力・保存する関数
async function loginAndSetupProfile(page: Page, userData: UserData): Promise<void> {
  await page.goto(BASE_URL);

  await page.locator('#login-btn').click();

  const loginDialog = page.getByRole('dialog', { name: 'ログイン' });
  await loginDialog.getByRole('textbox', { name: 'ユーザー名:' }).fill(userData.login.username);
  await loginDialog.getByRole('textbox', { name: 'パスワード:' }).fill(userData.login.password);
  await loginDialog.getByRole('button', { name: 'ログイン' }).click();

  await loginDialog.waitFor({ state: 'hidden' });

  await page.getByRole('link', { name: 'プロフィール' }).click();
  await page.waitForURL('**/user-profile.html');

  const nameInput = page.getByRole('textbox', { name: '名前' });
  await nameInput.waitFor({ state: 'visible' });

  await nameInput.fill(userData.profile.displayName);
  await page.getByRole('textbox', { name: '電話番号' }).fill(userData.profile.phone);
  await page.getByRole('combobox', { name: 'お支払い方法' }).selectOption(userData.profile.paymentMethod);
  await page.getByRole('button', { name: '保存' }).click();
  await page.reload();
}

test.describe('Hooksを使った場合の問題点', () => {

  test.beforeAll(() => {
    yamadaData = loadUserData('yamada');
    satoData = loadUserData('sato');
    tanakaData = loadUserData('tanaka');
  });

  test('山田太郎のプロファイル（Hooks版）', async ({ page }) => {
    await loginAndSetupProfile(page, yamadaData);

    await expect(page.getByRole('textbox', { name: '名前' }))
      .toHaveValue(yamadaData.profile.displayName);
  });

  test('佐藤花子のプロファイル（Hooks版）', async ({ page }) => {
    await loginAndSetupProfile(page, satoData);

    await expect(page.getByRole('textbox', { name: '名前' }))
      .toHaveValue(satoData.profile.displayName);
  });
});
