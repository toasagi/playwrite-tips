import { expect, Page } from '@playwright/test';

export class CartSection {
  constructor(private page: Page) {}

  async addProductByName(productName: string) {
    const card = this.page.locator('.product-card').filter({
      has: this.page.locator('.product-name', { hasText: new RegExp(`^${productName}$`) }),
    });
    await card.getByRole('button', { name: 'Add to Cart' }).click();
  }

  async addProducts(productNames: string[]) {
    for (const name of productNames) {
      await this.addProductByName(name);
    }
  }

  async verifyTotal(expectedTotal: string) {
    await expect(this.page.locator('#cart-total')).toHaveText(`Total: ${expectedTotal}`);
  }
}
