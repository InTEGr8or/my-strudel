const { test, expect } = require('@playwright/test');

test('note heads appear on sight-reading trainer after init', async ({ page }) => {
  await page.goto('/songs/sketches/sight-reading/');
  await page.waitForSelector('note-chart svg');

  const noteHeads = page.locator('note-chart svg #note-heads ellipse');
  await expect(noteHeads.first()).toBeAttached({ timeout: 5000 });

  const count = await noteHeads.count();
  expect(count).toBeGreaterThanOrEqual(1);

  const fill = await noteHeads.first().getAttribute('fill');
  expect(fill).toBeTruthy();

  const cx = await noteHeads.first().getAttribute('cx');
  const cy = await noteHeads.first().getAttribute('cy');
  expect(Number(cx)).toBeGreaterThan(0);
  expect(Number(cy)).toBeGreaterThan(0);
});

test('strudel song page has piano and no staff', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await expect(page.locator('#piano-container')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('note-chart')).toHaveCount(0);
  await expect(page.locator('#strudel-repl')).toBeVisible();
});

test('abc song page renders the tape staff', async ({ page }) => {
  await page.goto('/songs/sketches/i-iv-v-i/');
  const svg = page.locator('note-chart svg');
  await expect(svg).toBeVisible({ timeout: 5000 });
  const bands = svg.locator('#staff-bands text.staff-band-label');
  expect(await bands.count()).toBeGreaterThan(0);
  await expect(page.locator('#abc-trainer-panel')).toBeVisible();
  await expect(page.locator('#strudel-repl')).toHaveCount(0);
});

test('song selection via combobox changes notes and shows song title', async ({ page }) => {
  await page.goto('/songs/sketches/sight-reading/');
  await page.waitForSelector('note-chart svg');

  const noteHeads = page.locator('note-chart svg #note-heads ellipse');
  await expect(noteHeads.first()).toBeAttached({ timeout: 5000 });

  const input = page.locator('#trainer-song');
  await input.click();

  const list = page.locator('#song-list.open');
  await expect(list).toBeVisible();

  await list.locator('li').filter({ hasText: 'Mary Had a Little Lamb' }).click();

  await expect(input).toHaveValue('Mary Had a Little Lamb');

  await expect(noteHeads.first()).toBeAttached();

  const count = await noteHeads.count();
  expect(count).toBeGreaterThanOrEqual(1);
});
