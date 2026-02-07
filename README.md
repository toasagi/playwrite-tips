# Playwright BDD + Page Object Model Sample

This sample project demonstrates **Playwright-BDD** (Gherkin) combined with the **Page Object Model** pattern for E2E testing.

## Target Application

[ShopTodo - E2E Testing Practice App](https://toasagi.github.io/shoptodo-app/)

## Architecture

```
Gherkin Feature File (what to test)
    ↓
Step Definitions (how to test)
    ↓
Page Objects (UI interactions)
    ↓
Playwright (browser automation)
```

### Why BDD + POM?

| Aspect | Benefit |
|--------|---------|
| **Gherkin scenarios** | Readable test cases, even for non-developers |
| **Scenario Outline** | Data-driven tests without code duplication |
| **Page Objects** | Selectors and UI logic in one place |
| **Soft Assertions** | Verify multiple fields without stopping on first failure |

## Test Scenario

**Save and verify profile information for each user**

| User | Name | Phone | Payment Method |
|------|------|-------|----------------|
| yamada | Taro Yamada | 090-1234-5678 | Credit Card |
| sato | Hanako Sato | 080-9876-5432 | Bank Transfer |
| tanaka | Ichiro Tanaka | 070-1111-2222 | Cash on Delivery |

## File Structure

```
playwrite-tips/
├── features/
│   └── user-profile.feature      # Gherkin scenarios
├── src/
│   └── pages/
│       ├── BasePage.ts            # Shared: switchToEnglish()
│       ├── HomePage.ts            # Login trigger, navigation
│       ├── LoginDialog.ts         # Username/password/submit
│       └── ProfilePage.ts        # Name, phone, payment, save
├── steps/
│   ├── fixtures.ts                # BDD fixtures providing page objects
│   └── user-profile.steps.ts     # Given/When/Then implementations
├── test-data/
│   ├── yamada.json
│   ├── sato.json
│   └── tanaka.json
├── .features-gen/                 # Auto-generated (gitignored)
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npm test

# Run with browser visible
npm run test:headed

# Run in Playwright UI mode
npm run test:ui

# Generate BDD test files only
npm run bddgen
```

## How It Works

1. **`bddgen`** reads `features/*.feature` and generates Playwright test files in `.features-gen/`
2. **Playwright** runs the generated test files
3. Each step (Given/When/Then) calls **Page Object** methods
4. **Soft assertions** verify saved data without short-circuiting on failure
