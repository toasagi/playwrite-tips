import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';
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

Given(
  'I am logged in as {string} with cart data',
  async ({ page, testDataHolder }, user: string) => {
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

    const testDataPath = path.join(__dirname, '..', 'test-data', `${user}.json`);
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
    testDataHolder.cart = testData.cart;
  },
);

When('I add the specified products to the cart', async ({ cartSection, testDataHolder }) => {
  await cartSection.addProducts(testDataHolder.cart!.products);
});

Then('the cart total should be correct', async ({ cartSection, testDataHolder }) => {
  await cartSection.verifyTotal(testDataHolder.cart!.expectedTotal);
});
