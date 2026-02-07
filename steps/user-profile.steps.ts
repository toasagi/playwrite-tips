import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const { Given, When, Then } = createBdd(test);

type StorageState = {
  cookies: { name: string; value: string; domain: string; path: string }[];
  origins: { origin: string; localStorage: { name: string; value: string }[] }[];
};

function loadStorageState(user: string): StorageState {
  const filePath = path.join(__dirname, '..', '.auth', `${user}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

Given('the app is set to English', async ({ homePage }) => {
  await homePage.goto();
  await homePage.switchToEnglish();
});

Given('I am logged in as {string}', async ({ page }, user: string) => {
  const state = loadStorageState(user);
  await page.context().addCookies(state.cookies);
  for (const origin of state.origins) {
    for (const item of origin.localStorage) {
      await page.evaluate(
        ([key, value]) => localStorage.setItem(key, value),
        [item.name, item.value],
      );
    }
  }
  await page.reload();
});

When('I navigate to the profile page', async ({ homePage }) => {
  await homePage.navigateToProfile();
});

When(
  'I fill in the profile with name {string} phone {string} and payment {string}',
  async ({ profilePage }, name: string, phone: string, payment: string) => {
    await profilePage.fillProfile(name, phone, payment);
  },
);

When('I save the profile', async ({ profilePage }) => {
  await profilePage.save();
});

When('I reload the page', async ({ profilePage }) => {
  await profilePage.reload();
});

Then('the name field should display {string}', async ({ page }, name: string) => {
  await expect.soft(
    page.getByRole('textbox', { name: 'Name' }),
    'Name should be displayed correctly',
  ).toHaveValue(name);
});

Then('the phone field should display {string}', async ({ page }, phone: string) => {
  await expect.soft(
    page.getByRole('textbox', { name: 'Phone Number' }),
    'Phone should be displayed correctly',
  ).toHaveValue(phone);
});

Then('the payment method should be {string}', async ({ page }, payment: string) => {
  await expect.soft(
    page.getByRole('combobox', { name: 'Payment Method' }),
    'Payment method should be selected correctly',
  ).toHaveValue(payment);
});
