import { Page } from '@playwright/test';

export class LoginDialog {
  private dialog;

  constructor(private page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Login' });
  }

  async login(username: string, password: string) {
    await this.dialog.getByRole('textbox', { name: 'Username:' }).fill(username);
    await this.dialog.getByRole('textbox', { name: 'Password:' }).fill(password);
    await this.dialog.getByRole('button', { name: 'Login' }).click();
    await this.dialog.waitFor({ state: 'hidden' });
  }
}
