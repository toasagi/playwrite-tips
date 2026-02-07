import { test, expect } from './fixtures';

/**
 * ユーザープロファイル検証テスト
 *
 * このテストでは、Fixturesを使って：
 * 1. ユーザーごとに「ログイン＆データ入力済み」の状態を提供
 * 2. 必要なテストでのみFixtureが実行される（オンデマンド）
 * 3. Soft Assertionsで複数項目を一度に検証
 *
 * テストの流れ：
 * [Fixture] ログイン → データ入力 → 保存 → リロード
 * [テスト] 保存されたデータが正しく表示されていることを検証
 */

test.describe('ユーザープロファイル検証', () => {

  /**
   * 山田太郎のプロファイルを検証
   * - yamadaContext Fixture が使われる
   * - satoContext, tanakaContext は使われない（オンデマンド）
   */
  test('山田太郎のプロファイル情報が正しく保存・表示される', async ({ yamadaContext }) => {
    const { page, userData } = yamadaContext;

    // Fixtureでデータ入力・保存・リロードまで済んでいる
    // ここでは保存されたデータが正しく表示されていることを検証

    // Soft Assertionsで複数項目を一度に検証
    // 1つ失敗しても、他の項目も検証される
    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      '名前が正しく表示されること'
    ).toHaveValue(userData.profile.displayName);

    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      '電話番号が正しく表示されること'
    ).toHaveValue(userData.profile.phone);

    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      '支払い方法が正しく選択されていること'
    ).toHaveValue(userData.profile.paymentMethod);
  });

  /**
   * 佐藤花子のプロファイルを検証
   */
  test('佐藤花子のプロファイル情報が正しく保存・表示される', async ({ satoContext }) => {
    const { page, userData } = satoContext;

    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      '名前が正しく表示されること'
    ).toHaveValue(userData.profile.displayName);

    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      '電話番号が正しく表示されること'
    ).toHaveValue(userData.profile.phone);

    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      '支払い方法が正しく選択されていること'
    ).toHaveValue(userData.profile.paymentMethod);
  });

  /**
   * 田中一郎のプロファイルを検証
   */
  test('田中一郎のプロファイル情報が正しく保存・表示される', async ({ tanakaContext }) => {
    const { page, userData } = tanakaContext;

    await expect.soft(
      page.getByRole('textbox', { name: '名前' }),
      '名前が正しく表示されること'
    ).toHaveValue(userData.profile.displayName);

    await expect.soft(
      page.getByRole('textbox', { name: '電話番号' }),
      '電話番号が正しく表示されること'
    ).toHaveValue(userData.profile.phone);

    await expect.soft(
      page.getByRole('combobox', { name: 'お支払い方法' }),
      '支払い方法が正しく選択されていること'
    ).toHaveValue(userData.profile.paymentMethod);
  });
});
