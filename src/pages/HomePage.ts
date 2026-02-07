import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async goto() {
    await this.page.goto('./');
    await this.page.getByRole('button', { name: 'EN' }).waitFor({ state: 'visible' });
  }

  async clickLoginButton() {
    await this.page.locator('#login-btn').click();
  }

  async navigateToProfile() {
    await this.page.getByRole('link', { name: 'Profile' }).click();
    await this.page.waitForURL('**/user-profile.html');
  }
}
