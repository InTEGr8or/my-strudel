const { test, expect } = require('@playwright/test');

test('soundfont files are served', async ({ page }) => {
  const r1 = await page.request.get('/soundfonts/0000_JCLive_sf2_file.js');
  expect(r1.ok()).toBeTruthy();
  expect((await r1.text()).length).toBeGreaterThan(1000);

  const r2 = await page.request.get('/soundfonts/0050_JCLive_sf2_file.js');
  expect(r2.ok()).toBeTruthy();
  expect((await r2.text()).length).toBeGreaterThan(1000);
});

test('synth voice selection works', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.locator('.tab[data-tab="synth"]').click();
  await page.waitForSelector('#piano-status', { state: 'attached' });

  await page.locator('[data-voice="triangle"]').click();
  await expect(page.locator('[data-voice="triangle"]')).toHaveClass(/active/);

  await page.locator('[data-voice="sine"]').click();
  await expect(page.locator('[data-voice="sine"]')).toHaveClass(/active/);
});

test('playMidiNote creates AudioContext without throwing', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.waitForSelector('note-chart svg');

  const result = await page.evaluate(() => {
    if (typeof window.playMidiNote !== 'function') return 'playMidiNote not found';
    try {
      window.playMidiNote(60, 100);
      return 'ok';
    } catch (e) {
      return e.message;
    }
  });
  expect(result).toBe('ok');
});

test('oscillator voice plays without error', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.waitForSelector('note-chart svg');

  await page.evaluate(() => window.selectVoice('triangle'));

  const result = await page.evaluate(() => {
    try {
      window.playMidiNote(72, 127);
      return 'ok';
    } catch (e) {
      return e.message;
    }
  });
  expect(result).toBe('ok');
});
