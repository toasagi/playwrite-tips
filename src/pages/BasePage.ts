import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async switchToEnglish() {
    await this.page.getByRole('button', { name: 'EN' }).click();
  }
}
