import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  private nameInput = this.page.getByRole('textbox', { name: 'Name' });
  private phoneInput = this.page.getByRole('textbox', { name: 'Phone Number' });
  private paymentSelect = this.page.getByRole('combobox', { name: 'Payment Method' });

  async fillProfile(name: string, phone: string, paymentMethod: string) {
    await this.nameInput.waitFor({ state: 'visible' });
    await this.nameInput.fill(name);
    await this.phoneInput.fill(phone);
    await this.paymentSelect.selectOption(paymentMethod);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async reload() {
    await this.page.reload();
    await this.nameInput.waitFor({ state: 'visible' });
  }
}
