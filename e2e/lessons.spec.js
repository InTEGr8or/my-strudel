const { test, expect } = require('@playwright/test');

test('dashboard shows lessons section with cards', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.lesson-card');

  const cards = page.locator('.lesson-card');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(7);

  const firstTitle = await cards.first().locator('.title').textContent();
  expect(firstTitle).toContain('C Major');
});

test('lesson page renders theory content and trainer', async ({ page }) => {
  await page.goto('/lessons/c-major/');
  await page.waitForSelector('#lesson-content');
  await page.waitForSelector('note-chart svg');
  await page.waitForSelector('#score-correct');

  const content = page.locator('#lesson-content');
  await expect(content).toContainText('C Major');
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

test('chord lesson page renders theory and staff chord reference', async ({ page }) => {
  await page.goto('/lessons/c-major-chord/');
  await page.waitForSelector('#lesson-content');
  await page.waitForSelector('note-chart svg');
  await page.waitForSelector('#chord-reference');

  const content = page.locator('#lesson-content');
  await expect(content).toContainText('C Major Chord');

  const chordRef = page.locator('#chord-reference ellipse');
  const count = await chordRef.count();
  expect(count).toBe(3);
});

test('chord lesson loads exercises and trainer initializes', async ({ page }) => {
  await page.goto('/lessons/c-major-chord/');
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

test('diatonic triads lesson page renders theory grid', async ({ page }) => {
  await page.goto('/lessons/diatonic-triads/');
  await page.waitForSelector('#lesson-content');
  await page.waitForSelector('note-chart svg');

  const content = page.locator('#lesson-content');
  await expect(content).toContainText('Diatonic Triads');
  await expect(content).toContainText('vii°');
});

test('chord lesson nav links connect correctly', async ({ page }) => {
  await page.goto('/lessons/g-major-chord/');
  await page.waitForSelector('#lesson-content');

  const links = page.locator('#lesson-content a');
  const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));

  const prevOk = hrefs.some((h) => h && h.includes('a-minor-chord'));
  const nextOk = hrefs.some((h) => h && h.includes('diatonic-triads'));
  expect(prevOk).toBe(true);
  expect(nextOk).toBe(true);
});

test('held notes render as ghosts at the HEAD position', async ({ page }) => {
  await page.goto('/lessons/c-major/');
  await page.waitForSelector('note-chart svg');

  await page.waitForFunction(function () {
    var chart = document.querySelector('note-chart');
    return chart && chart.querySelector('#head-ghosts');
  });

  await page.evaluate(function () {
    var event = { data: [0x90, 61, 100] };
    if (typeof handleMidiMessage === 'function') handleMidiMessage(event);
    else if (window.handleMidiMessage) window.handleMidiMessage(event);
  });

  await page.waitForFunction(function () {
    var chart = document.querySelector('note-chart');
    var ghosts = chart && chart.querySelector('#head-ghosts');
    return ghosts && ghosts.querySelectorAll('ellipse').length >= 1;
  });
});
