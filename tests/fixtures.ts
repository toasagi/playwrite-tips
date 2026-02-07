import { test as base, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ユーザーデータの型定義
export type UserProfile = {
  displayName: string;
  phone: string;
  paymentMethod: string;
};

export type UserData = {
  username: string;
  login: {
    username: string;
    password: string;
  };
  profile: UserProfile;
};

// ユーザーコンテキスト：データ入力済みのページ + 期待値データ
export type UserContext = {
  page: Page;
  userData: UserData;
};

// ベースURL
const BASE_URL = 'https://toasagi.github.io/shoptodo-app';

// ユーザーデータを読み込む関数
function loadUserData(username: string): UserData {
  const filePath = path.join(__dirname, '..', 'test-data', `${username}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// ログインしてプロフィールデータを入力・保存する関数
async function loginAndSetupProfile(page: Page, userData: UserData): Promise<void> {
  // 1. トップページへ移動
  await page.goto(BASE_URL);

  // 2. ヘッダーのログインボタンをクリック（idで特定）
  await page.locator('#login-btn').click();

  // 3. ダイアログ内でログイン情報を入力
  const loginDialog = page.getByRole('dialog', { name: 'ログイン' });
  await loginDialog.getByRole('textbox', { name: 'ユーザー名:' }).fill(userData.login.username);
  await loginDialog.getByRole('textbox', { name: 'パスワード:' }).fill(userData.login.password);

  // 4. ダイアログ内のログインボタンをクリック（submitボタン）
  await loginDialog.getByRole('button', { name: 'ログイン' }).click();

  // 5. ダイアログが閉じるのを待つ
  await loginDialog.waitFor({ state: 'hidden' });

  // 6. プロフィールページへ移動
  await page.getByRole('link', { name: 'プロフィール' }).click();

  // 7. プロフィールページの読み込みを待つ
  await page.waitForURL('**/user-profile.html');

  // 8. 入力フィールドが表示されるのを待つ
  const nameInput = page.getByRole('textbox', { name: '名前' });
  await nameInput.waitFor({ state: 'visible' });

  // 9. プロフィールデータを入力
  await nameInput.fill(userData.profile.displayName);
  await page.getByRole('textbox', { name: '電話番号' }).fill(userData.profile.phone);
  await page.getByRole('combobox', { name: 'お支払い方法' }).selectOption(userData.profile.paymentMethod);

  // 10. 保存ボタンをクリック
  await page.getByRole('button', { name: '保存' }).click();

  // 11. ページをリロードしてデータが永続化されていることを確認
  await page.reload();
}

// Fixturesの定義
export const test = base.extend<{
  yamadaContext: UserContext;
  satoContext: UserContext;
  tanakaContext: UserContext;
}>({
  // 山田太郎：ログイン＆データ入力済みの状態を提供
  yamadaContext: async ({ browser }, use) => {
    const userData = loadUserData('yamada');
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginAndSetupProfile(page, userData);

    await use({ page, userData });

    await context.close();
  },

  // 佐藤花子：ログイン＆データ入力済みの状態を提供
  satoContext: async ({ browser }, use) => {
    const userData = loadUserData('sato');
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginAndSetupProfile(page, userData);

    await use({ page, userData });

    await context.close();
  },

  // 田中一郎：ログイン＆データ入力済みの状態を提供
  tanakaContext: async ({ browser }, use) => {
    const userData = loadUserData('tanaka');
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginAndSetupProfile(page, userData);

    await use({ page, userData });

    await context.close();
  },
});

export { expect } from '@playwright/test';
