import { test as base } from 'playwright-bdd';
import { HomePage } from '../src/pages/HomePage';
import { LoginDialog } from '../src/pages/LoginDialog';
import { ProfilePage } from '../src/pages/ProfilePage';

type PageObjects = {
  homePage: HomePage;
  loginDialog: LoginDialog;
  profilePage: ProfilePage;
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
});
