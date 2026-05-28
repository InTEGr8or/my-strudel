const { test, expect } = require('@playwright/test');

test('dashboard shows lessons section with cards', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.lesson-card');

  const cards = page.locator('.lesson-card');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(3);

  const firstTitle = await cards.first().locator('.title').textContent();
  expect(firstTitle).toContain('C Major');
});

test('lesson page renders theory content and trainer', async ({ page }) => {
  await page.goto('/lessons/c-major/');
  await page.waitForSelector('#lesson-content');
  await page.waitForSelector('note-chart svg');
  await page.waitForSelector('#trainer-status');
  await page.waitForSelector('#score-correct');

  const content = page.locator('#lesson-content');
  await expect(content).toContainText('C Major');

  const status = page.locator('#trainer-status');
  await expect(status).toBeAttached();
});

test('lesson page loads embedded notes and trainer initializes', async ({ page }) => {
  await page.goto('/lessons/c-major/');
  await page.waitForSelector('note-chart svg');

  const initialized = await page.evaluate(() => {
    return new Promise((resolve) => {
      const check = () => {
        const chart = document.querySelector('note-chart');
        const heads = chart && chart.querySelector('#note-heads');
        const hasEllipses = heads && heads.querySelectorAll('ellipse').length > 0;
        if (hasEllipses) resolve(true);
        else setTimeout(check, 200);
      };
      check();
    });
  });
  expect(initialized).toBe(true);
});

test('lesson page pattern buttons change pattern size', async ({ page }) => {
  await page.goto('/lessons/c-major/');
  await page.waitForSelector('note-chart svg');

  const btn2 = page.locator('.pat-btn[data-pattern="2"]');
  await btn2.click();

  await expect(btn2).toHaveCSS('font-weight', '700');
});

test('lesson page shows correct and wrong badges', async ({ page }) => {
  await page.goto('/lessons/c-major/');
  await page.waitForSelector('#score-correct');
  await page.waitForSelector('#score-wrong');

  await expect(page.locator('#score-correct')).toHaveText('0');
  await expect(page.locator('#score-wrong')).toHaveText('0');
});

test('dashboard lesson cards have badges and open correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.lesson-card');

  const badgeRow = page.locator('.lesson-card').first().locator('.badge-row');
  await expect(badgeRow).toBeAttached();

  const badges = badgeRow.locator('.badge');
  const count = await badges.count();
  expect(count).toBeGreaterThanOrEqual(3);

  await page.locator('.lesson-card').first().locator('.open-btn').click();
  await page.waitForURL('**/lessons/**');
  await page.waitForSelector('#lesson-content');
});
