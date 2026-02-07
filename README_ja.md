# Playwright Fixtures サンプル

このサンプルは、Playwright の **Fixtures** 機能の価値を示すためのプロジェクトです。

## 対象アプリケーション

[ShopTodo - E2Eテスト練習用アプリ](https://toasagi.github.io/shoptodo-app/)

## Fixtures を使う理由

### 問題：Hooks だけでは解決できないこと

```typescript
// beforeAll は全テストで実行される
test.beforeAll(() => {
  yamadaData = loadUserData('yamada');   // 全テストで読み込み
  satoData = loadUserData('sato');       // 全テストで読み込み
  tanakaData = loadUserData('tanaka');   // 全テストで読み込み
});

test('山田のテスト', async ({ page }) => {
  // ↑ このテストだけ実行しても、佐藤・田中のデータも読み込まれる
  // ↑ 何が必要かはテストコードを見てもわからない
});
```

### 解決：Fixtures なら

```typescript
test('山田のテスト', async ({ yamadaContext }) => {
  // ↑ yamadaContext だけがセットアップされる（オンデマンド）
  // ↑ 何が必要かがテスト宣言だけでわかる（明示的な依存関係）
  const { page, userData } = yamadaContext;
});
```

## テストシナリオ

**ユーザーごとに異なるプロファイル情報を入力・保存・検証する**

| ユーザー | 名前 | 電話番号 | 支払い方法 |
|----------|------|----------|------------|
| 山田太郎 | 山田太郎 | 090-1234-5678 | クレジットカード |
| 佐藤花子 | 佐藤花子 | 080-9876-5432 | 銀行振込 |
| 田中一郎 | 田中一郎 | 070-1111-2222 | 代金引換 |

## ファイル構成

```
playwright-fixtures-sample/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── test-data/
│   ├── yamada.json      # 山田太郎の期待値データ
│   ├── sato.json        # 佐藤花子の期待値データ
│   └── tanaka.json      # 田中一郎の期待値データ
└── tests/
    ├── fixtures.ts              # Fixtures定義（核心部分）
    ├── user-profile.spec.ts     # Fixturesを使ったテスト
    └── hooks-comparison.spec.ts # 比較用：Hooksを使った場合
```

## 各ファイルの内容

### package.json

```json
{
  "name": "playwright-fixtures-sample",
  "version": "1.0.0",
  "description": "Playwright Fixtures サンプル - ユーザーごとのプロファイル検証",
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:ui": "npx playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0"
  }
}
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://toasagi.github.io/shoptodo-app/',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["tests/**/*.ts"]
}
```

### test-data/yamada.json

```json
{
  "username": "yamada",
  "profile": {
    "displayName": "山田太郎",
    "phone": "090-1234-5678",
    "paymentMethod": "credit_card"
  }
}
```

### test-data/sato.json

```json
{
  "username": "sato",
  "profile": {
    "displayName": "佐藤花子",
    "phone": "080-9876-5432",
    "paymentMethod": "bank_transfer"
  }
}
```

### test-data/tanaka.json

```json
{
  "username": "tanaka",
  "profile": {
    "displayName": "田中一郎",
    "phone": "070-1111-2222",
    "paymentMethod": "cash_on_delivery"
  }
}
```

### tests/fixtures.ts

```typescript
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
  await loginDialog.getByRole('textbox', { name: 'ユーザー名:' }).fill('demo');
  await loginDialog.getByRole('textbox', { name: 'パスワード:' }).fill('Demo@2025!');
  
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
```

### tests/user-profile.spec.ts

```typescript
import { test, expect } from './fixtures';

/**
 * ユーザープロファイル検証テスト
 * 
 * このテストでは、Fixturesを使って：
 * 1. ユーザーごとに「ログイン＆データ入力済み」の状態を提供
 * 2. 必要なテストでのみFixtureが実行される（オンデマンド）
 * 3. Soft Assertionsで複数項目を一度に検証
 * 
 * テストの流れ：
 * [Fixture] ログイン → データ入力 → 保存 → リロード
 * [テスト] 保存されたデータが正しく表示されていることを検証
 */

test.describe('ユーザープロファイル検証', () => {
  
  /**
   * 山田太郎のプロファイルを検証
   * - yamadaContext Fixture が使われる
   * - satoContext, tanakaContext は使われない（オンデマンド）
   */
  test('山田太郎のプロファイル情報が正しく保存・表示される', async ({ yamadaContext }) => {
    const { page, userData } = yamadaContext;
    
    // Fixtureでデータ入力・保存・リロードまで済んでいる
    // ここでは保存されたデータが正しく表示されていることを検証
    
    // Soft Assertionsで複数項目を一度に検証
    // 1つ失敗しても、他の項目も検証される
    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      '名前が正しく表示されること'
    ).toHaveValue(userData.profile.displayName);
    
    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      '電話番号が正しく表示されること'
    ).toHaveValue(userData.profile.phone);
    
    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      '支払い方法が正しく選択されていること'
    ).toHaveValue(userData.profile.paymentMethod);
  });

  /**
   * 佐藤花子のプロファイルを検証
   */
  test('佐藤花子のプロファイル情報が正しく保存・表示される', async ({ satoContext }) => {
    const { page, userData } = satoContext;
    
    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      '名前が正しく表示されること'
    ).toHaveValue(userData.profile.displayName);
    
    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      '電話番号が正しく表示されること'
    ).toHaveValue(userData.profile.phone);
    
    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      '支払い方法が正しく選択されていること'
    ).toHaveValue(userData.profile.paymentMethod);
  });

  /**
   * 田中一郎のプロファイルを検証
   */
  test('田中一郎のプロファイル情報が正しく保存・表示される', async ({ tanakaContext }) => {
    const { page, userData } = tanakaContext;
    
    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      '名前が正しく表示されること'
    ).toHaveValue(userData.profile.displayName);
    
    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      '電話番号が正しく表示されること'
    ).toHaveValue(userData.profile.phone);
    
    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      '支払い方法が正しく選択されていること'
    ).toHaveValue(userData.profile.paymentMethod);
  });
});
```

### tests/hooks-comparison.spec.ts

```typescript
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
  await loginDialog.getByRole('textbox', { name: 'ユーザー名:' }).fill('demo');
  await loginDialog.getByRole('textbox', { name: 'パスワード:' }).fill('Demo@2025!');
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
```

## 実行方法

```bash
# 依存関係のインストール
npm install

# Playwrightブラウザのインストール（初回のみ）
npx playwright install chromium

# テスト実行
npm test

# UIモードで実行（テストの流れを確認）
npm run test:ui

# ヘッドありで実行（ブラウザを表示）
npm run test:headed
```

## Fixtures の価値まとめ

| 観点 | Hooks | Fixtures |
|------|-------|----------|
| **実行タイミング** | beforeAll/beforeEach は全テストで実行 | **必要なテストでのみ実行** |
| **依存関係** | 暗黙的（変数で共有） | **明示的（引数で宣言）** |
| **テストの可読性** | 変数定義を見る必要あり | **テスト宣言だけでわかる** |
| **セットアップ/ティアダウン** | 別の場所に書く | **同じ場所に書ける** |
| **再利用性** | ファイル内のみ | **全テストファイルで共通利用可能** |

## シリーズとの組み合わせ

このサンプルでは、シリーズで紹介した機能を組み合わせています：

1. **storageState の考え方**（Part 4）→ ログイン状態の管理
2. **Fixtures**（Part 6）→ 認証状態 + 期待値データをセットで提供
3. **Soft Assertions**（Part 5）→ 複数項目を一度に検証

```
ユーザーデータ（JSON）
    ↓
Fixtures（ログイン + データ入力 + 保存をカプセル化）
    ↓
テスト（Soft Assertionsで効率的に検証）
```
