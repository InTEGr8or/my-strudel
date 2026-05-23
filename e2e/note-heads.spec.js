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

test('normal song page renders note-chart SVG', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  const svg = page.locator('note-chart svg');
  await expect(svg).toBeVisible({ timeout: 5000 });

  const bands = svg.locator('#staff-bands rect');
  const bandCount = await bands.count();
  expect(bandCount).toBeGreaterThan(0);
});
