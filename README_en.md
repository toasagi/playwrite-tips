# Playwright Fixtures Sample

This sample project demonstrates the value of Playwright's **Fixtures** feature.

## Target Application

[ShopTodo - E2E Testing Practice App](https://toasagi.github.io/shoptodo-app/)

## Why Use Fixtures?

### Problem: What Hooks Can't Solve

```typescript
// beforeAll runs for ALL tests
test.beforeAll(() => {
  yamadaData = loadUserData('yamada');   // Loaded for all tests
  satoData = loadUserData('sato');       // Loaded for all tests
  tanakaData = loadUserData('tanaka');   // Loaded for all tests
});

test('Yamada test', async ({ page }) => {
  // ↑ Even if you run only this test, Sato and Tanaka data are also loaded
  // ↑ You can't tell what's needed just by looking at the test code
});
```

### Solution: With Fixtures

```typescript
test('Yamada test', async ({ yamadaContext }) => {
  // ↑ Only yamadaContext is set up (on-demand)
  // ↑ You can see what's needed just from the test declaration (explicit dependencies)
  const { page, userData } = yamadaContext;
});
```

## Test Scenario

**Input, save, and verify different profile information for each user**

| User | Name | Phone | Payment Method |
|------|------|-------|----------------|
| Yamada | 山田太郎 | 090-1234-5678 | Credit Card |
| Sato | 佐藤花子 | 080-9876-5432 | Bank Transfer |
| Tanaka | 田中一郎 | 070-1111-2222 | Cash on Delivery |

## File Structure

```
playwright-fixtures-sample/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── test-data/
│   ├── yamada.json      # Yamada's expected data
│   ├── sato.json        # Sato's expected data
│   └── tanaka.json      # Tanaka's expected data
└── tests/
    ├── fixtures.ts              # Fixtures definition (core)
    ├── user-profile.spec.ts     # Tests using Fixtures
    └── hooks-comparison.spec.ts # Comparison: Using Hooks
```

## File Contents

### package.json

```json
{
  "name": "playwright-fixtures-sample",
  "version": "1.0.0",
  "description": "Playwright Fixtures Sample - User Profile Verification",
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
  "login": {
    "username": "demo",
    "password": "Demo@2025!"
  },
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
  "login": {
    "username": "user1",
    "password": "User1@2025!"
  },
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
  "login": {
    "username": "user2",
    "password": "User2@2025!"
  },
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

// User data type definitions
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

// User context: Page with data entered + expected data
export type UserContext = {
  page: Page;
  userData: UserData;
};

// Base URL
const BASE_URL = 'https://toasagi.github.io/shoptodo-app';

// Function to load user data
function loadUserData(username: string): UserData {
  const filePath = path.join(__dirname, '..', 'test-data', `${username}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// Function to login and setup profile data
async function loginAndSetupProfile(page: Page, userData: UserData): Promise<void> {
  // 1. Navigate to top page
  await page.goto(BASE_URL);
  
  // 2. Click login button in header (identified by id)
  await page.locator('#login-btn').click();
  
  // 3. Enter login credentials in dialog
  const loginDialog = page.getByRole('dialog', { name: 'ログイン' });
  await loginDialog.getByRole('textbox', { name: 'ユーザー名:' }).fill(userData.login.username);
  await loginDialog.getByRole('textbox', { name: 'パスワード:' }).fill(userData.login.password);

  // 4. Click login button in dialog (submit button)
  await loginDialog.getByRole('button', { name: 'ログイン' }).click();
  
  // 5. Wait for dialog to close
  await loginDialog.waitFor({ state: 'hidden' });
  
  // 6. Navigate to profile page
  await page.getByRole('link', { name: 'プロフィール' }).click();
  
  // 7. Wait for profile page to load
  await page.waitForURL('**/user-profile.html');
  
  // 8. Wait for input field to be visible
  const nameInput = page.getByRole('textbox', { name: '名前' });
  await nameInput.waitFor({ state: 'visible' });
  
  // 9. Enter profile data
  await nameInput.fill(userData.profile.displayName);
  await page.getByRole('textbox', { name: '電話番号' }).fill(userData.profile.phone);
  await page.getByRole('combobox', { name: 'お支払い方法' }).selectOption(userData.profile.paymentMethod);
  
  // 10. Click save button
  await page.getByRole('button', { name: '保存' }).click();
  
  // 11. Reload page to verify data persistence
  await page.reload();
}

// Fixtures definition
export const test = base.extend<{
  yamadaContext: UserContext;
  satoContext: UserContext;
  tanakaContext: UserContext;
}>({
  // Yamada: Provide logged-in state with data entered
  yamadaContext: async ({ browser }, use) => {
    const userData = loadUserData('yamada');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await loginAndSetupProfile(page, userData);
    
    await use({ page, userData });
    
    await context.close();
  },

  // Sato: Provide logged-in state with data entered
  satoContext: async ({ browser }, use) => {
    const userData = loadUserData('sato');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await loginAndSetupProfile(page, userData);
    
    await use({ page, userData });
    
    await context.close();
  },

  // Tanaka: Provide logged-in state with data entered
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
 * User Profile Verification Tests
 * 
 * This test uses Fixtures to:
 * 1. Provide "logged-in with data entered" state for each user
 * 2. Only execute Fixtures for tests that need them (on-demand)
 * 3. Verify multiple items at once with Soft Assertions
 * 
 * Test flow:
 * [Fixture] Login → Enter data → Save → Reload
 * [Test] Verify that saved data is displayed correctly
 */

test.describe('User Profile Verification', () => {
  
  /**
   * Verify Yamada's profile
   * - yamadaContext Fixture is used
   * - satoContext, tanakaContext are NOT used (on-demand)
   */
  test('Yamada profile data is saved and displayed correctly', async ({ yamadaContext }) => {
    const { page, userData } = yamadaContext;
    
    // Fixture has already done: data entry → save → reload
    // Here we verify that saved data is displayed correctly
    
    // Soft Assertions verify multiple items at once
    // Even if one fails, other items are still verified
    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      'Name should be displayed correctly'
    ).toHaveValue(userData.profile.displayName);
    
    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      'Phone should be displayed correctly'
    ).toHaveValue(userData.profile.phone);
    
    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      'Payment method should be selected correctly'
    ).toHaveValue(userData.profile.paymentMethod);
  });

  /**
   * Verify Sato's profile
   */
  test('Sato profile data is saved and displayed correctly', async ({ satoContext }) => {
    const { page, userData } = satoContext;
    
    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      'Name should be displayed correctly'
    ).toHaveValue(userData.profile.displayName);
    
    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      'Phone should be displayed correctly'
    ).toHaveValue(userData.profile.phone);
    
    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      'Payment method should be selected correctly'
    ).toHaveValue(userData.profile.paymentMethod);
  });

  /**
   * Verify Tanaka's profile
   */
  test('Tanaka profile data is saved and displayed correctly', async ({ tanakaContext }) => {
    const { page, userData } = tanakaContext;
    
    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      'Name should be displayed correctly'
    ).toHaveValue(userData.profile.displayName);
    
    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      'Phone should be displayed correctly'
    ).toHaveValue(userData.profile.phone);
    
    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      'Payment method should be selected correctly'
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
 * Comparison: Tests using Hooks
 */

const BASE_URL = 'https://toasagi.github.io/shoptodo-app';

// User data type definitions
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

// Variables shared across all tests (implicit dependencies)
let yamadaData: UserData;
let satoData: UserData;
let tanakaData: UserData;

// Function to load user data
function loadUserData(username: string): UserData {
  const filePath = path.join(__dirname, '..', 'test-data', `${username}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// Function to login and setup profile data
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

test.describe('Problems with Hooks approach', () => {
  
  test.beforeAll(() => {
    yamadaData = loadUserData('yamada');
    satoData = loadUserData('sato');
    tanakaData = loadUserData('tanaka');
  });

  test('Yamada profile (Hooks version)', async ({ page }) => {
    await loginAndSetupProfile(page, yamadaData);
    
    await expect(page.getByRole('textbox', { name: '名前' }))
      .toHaveValue(yamadaData.profile.displayName);
  });

  test('Sato profile (Hooks version)', async ({ page }) => {
    await loginAndSetupProfile(page, satoData);
    
    await expect(page.getByRole('textbox', { name: '名前' }))
      .toHaveValue(satoData.profile.displayName);
  });
});
```

## How to Run

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium

# Run tests
npm test

# Run in UI mode (see test flow)
npm run test:ui

# Run with browser visible
npm run test:headed
```

## Value of Fixtures Summary

| Aspect | Hooks | Fixtures |
|--------|-------|----------|
| **Execution Timing** | beforeAll/beforeEach runs for all tests | **Runs only for tests that need it** |
| **Dependencies** | Implicit (shared via variables) | **Explicit (declared as parameters)** |
| **Test Readability** | Need to check variable definitions | **Clear from test declaration alone** |
| **Setup/Teardown** | Written in separate locations | **Can be written in same location** |
| **Reusability** | Within file only | **Shared across all test files** |

## Combination with Series

This sample combines features introduced in the series:

1. **Fixtures** (Part 6) → Provide auth + expected data as a set
2. **Soft Assertions** (Part 5) → Verify multiple items at once

```
User Data (JSON)
    ↓
Fixtures (Encapsulate login + data entry + save)
    ↓
Tests (Efficiently verify with Soft Assertions)
```
