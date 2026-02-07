import { test as setup } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { LoginDialog } from './pages/LoginDialog';
import * as fs from 'fs';
import * as path from 'path';

const authDir = path.join(__dirname, '..', '.auth');
fs.mkdirSync(authDir, { recursive: true });

const users = ['yamada', 'sato', 'tanaka'];

for (const user of users) {
  setup(`authenticate as ${user}`, async ({ page }) => {
    const dataPath = path.join(__dirname, '..', 'test-data', `${user}.json`);
    const userData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const homePage = new HomePage(page);
    const loginDialog = new LoginDialog(page);

    await homePage.goto();
    await homePage.switchToEnglish();
    await homePage.clickLoginButton();
    await loginDialog.login(userData.login.username, userData.login.password);

    await page.context().storageState({ path: path.join(authDir, `${user}.json`) });
  });
}
