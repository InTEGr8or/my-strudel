const { test, expect } = require('@playwright/test');

test('keyboard picker dims the on-screen piano to the chosen range', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('keyboard-id'));
  await page.goto('/lessons/notes-intervals-degrees/');
  await page.waitForSelector('#piano-container .piano-key[data-midi]');
  await page.locator('.tab[data-tab="synth"]').click();
  await expect(page.locator('#keyboard-range')).toBeVisible();
  await expect(page.locator('#keyboard-range')).toHaveValue('32-key');
  await expect(page.locator('#keyboard-range-hint')).toContainText('F2');

  const dimmed = (midi) =>
    page.locator(`#piano-container .piano-key[data-midi="${midi}"]`).evaluate((el) => el.classList.contains('dimmed'));

  expect(await dimmed(40)).toBe(true);
  expect(await dimmed(41)).toBe(false);
  expect(await dimmed(72)).toBe(false);
  expect(await dimmed(73)).toBe(true);

  await page.selectOption('#keyboard-range', '88-key');
  expect(await dimmed(21)).toBe(false);
  expect(await dimmed(40)).toBe(false);
  expect(await dimmed(108)).toBe(false);

  await page.selectOption('#keyboard-range', '25-key');
  expect(await dimmed(35)).toBe(true);
  expect(await dimmed(36)).toBe(false);
  expect(await dimmed(60)).toBe(false);
  expect(await dimmed(61)).toBe(true);

  const compact = page.locator('staff-player .piano-key[data-midi="61"]').first();
  await expect(compact).toHaveClass(/dimmed/);
});

test('Calibrate learns the range from the lowest then highest key', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('keyboard-id');
    localStorage.removeItem('keyboard-custom');
  });
  await page.goto('/lessons/notes-intervals-degrees/');
  await page.waitForSelector('#piano-container .piano-key[data-midi]');
  await expect(page.locator('#calibrate-btn')).toBeVisible();
  await expect(page.locator('#keyboard-span')).toHaveText('F2–C5');
  await page.locator('#calibrate-btn').click();
  await expect(page.locator('#calibrate-row')).toBeVisible();
  await expect(page.locator('#calibrate-prompt')).toContainText('lowest');
  await expect(page.locator('#calibrate-low')).toHaveText('F2');
  await expect(page.locator('#calibrate-high')).toHaveText('C5');

  await page.evaluate(() => {
    window.handleMidiMessage({ data: [0x90, 41, 100] });
    window.handleMidiMessage({ data: [0x80, 41, 0] });
  });
  await expect(page.locator('#calibrate-low')).toHaveText('F2');
  await expect(page.locator('#calibrate-prompt')).toContainText('highest');

  await page.evaluate(() => {
    window.handleMidiMessage({ data: [0x90, 72, 100] });
    window.handleMidiMessage({ data: [0x80, 72, 0] });
  });
  await expect(page.locator('#calibrate-row')).toBeHidden();

  const dimmed = (midi) =>
    page.locator(`#piano-container .piano-key[data-midi="${midi}"]`).evaluate((el) => el.classList.contains('dimmed'));
  expect(await dimmed(40)).toBe(true);
  expect(await dimmed(41)).toBe(false);
  expect(await dimmed(72)).toBe(false);
  expect(await dimmed(73)).toBe(true);

  await page.locator('.tab[data-tab="synth"]').click();
  await expect(page.locator('#keyboard-range')).toHaveValue('custom');
  await expect(page.locator('#keyboard-range-hint')).toContainText('F2');
  await expect(page.locator('#keyboard-span')).toHaveText('F2–C5');
});

test('Calibrate can be cancelled, and the on-screen piano can set the ends', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('keyboard-id', '88-key'));
  await page.goto('/lessons/c-major/');
  await page.waitForSelector('#piano-container .piano-key[data-midi]');

  const tap = (midi) =>
    page.locator(`#piano-container .piano-key[data-midi="${midi}"]`).dispatchEvent('pointerdown');

  await expect(page.locator('#keyboard-span')).toHaveText('A0–C8');
  await page.locator('#calibrate-btn').click();
  await expect(page.locator('#calibrate-low')).toHaveText('A0');
  await expect(page.locator('#calibrate-high')).toHaveText('C8');
  await tap(48);
  await expect(page.locator('#calibrate-low')).toHaveText('C3');
  await expect(page.locator('#calibrate-high')).toHaveText('C8');
  await page.locator('#calibrate-cancel').click();
  await expect(page.locator('#calibrate-row')).toBeHidden();
  const stillFull = await page.locator('#piano-container .piano-key[data-midi="21"]').evaluate((el) =>
    el.classList.contains('dimmed')
  );
  expect(stillFull).toBe(false);

  await page.locator('#calibrate-btn').click();
  await tap(36);
  await tap(60);
  await expect(page.locator('#calibrate-row')).toBeHidden();
  const dimmed = (midi) =>
    page.locator(`#piano-container .piano-key[data-midi="${midi}"]`).evaluate((el) => el.classList.contains('dimmed'));
  expect(await dimmed(35)).toBe(true);
  expect(await dimmed(36)).toBe(false);
  expect(await dimmed(60)).toBe(false);
  expect(await dimmed(61)).toBe(true);
});
