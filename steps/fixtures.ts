import { test as base } from 'playwright-bdd';
import { HomePage } from '../src/pages/HomePage';
import { LoginDialog } from '../src/pages/LoginDialog';
import { ProfilePage } from '../src/pages/ProfilePage';
import { CartSection } from '../src/pages/CartSection';

type CartTestData = { products: string[]; expectedTotal: string };
type TestDataHolder = { cart: CartTestData | null };

type PageObjects = {
  homePage: HomePage;
  loginDialog: LoginDialog;
  profilePage: ProfilePage;
  cartSection: CartSection;
  testDataHolder: TestDataHolder;
};

export const test = base.extend<PageObjects>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginDialog: async ({ page }, use) => {
    await use(new LoginDialog(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  cartSection: async ({ page }, use) => {
    await use(new CartSection(page));
  },
  testDataHolder: async ({}, use) => {
    await use({ cart: null });
  },
});
