const { test, expect } = require('@playwright/test');

test('notes are positioned proportionally within bars for Ode to Joy (M:4/4, L:1/8)', async ({ page }) => {
  await page.goto('/songs/sketches/sight-reading/');
  await page.waitForSelector('note-chart svg');

  // Select Ode to Joy
  const input = page.locator('#trainer-song');
  await input.click();
  const list = page.locator('#song-list.open');
  await expect(list).toBeVisible();
  await list.locator('li').filter({ hasText: 'Ode to Joy' }).click();
  await expect(input).toHaveValue('Ode to Joy');

  await page.waitForTimeout(100);

  // Read note positions, bar line positions, and HEAD position from the SVG
  const data = await page.evaluate(() => {
    const chart = document.querySelector('note-chart');
    if (!chart) return null;
    const ctx = chart._ctx;
    if (!ctx) return null;

    const ts = chart.timeSignature;
    if (!ts) return { error: 'no time signature' };

    const spacing = (ctx.STAFF_R - ctx.LEFT_PAD - 60) / 4;

    const headLine = chart.querySelector('#head-line line');
    const headX = headLine ? parseFloat(headLine.getAttribute('x1')) : null;

    const heads = chart.querySelector('#note-heads');
    if (!heads) return { error: 'no note-heads' };

    const notes = [];
    const barLines = [];
    for (const child of heads.children) {
      if (child.tagName === 'line') {
        const x = parseFloat(child.getAttribute('x1'));
        if (!isNaN(x)) barLines.push(x);
      } else if (child.tagName === 'g') {
        const ellipse = child.querySelector('ellipse');
        if (ellipse) {
          const cx = parseFloat(ellipse.getAttribute('cx'));
          if (!isNaN(cx)) notes.push(cx);
        }
      }
    }

    return { headX, notes, barLines, spacing, ts, LEFT_PAD: ctx.LEFT_PAD, STAFF_R: ctx.STAFF_R, SPACING: ctx.SPACING };
  });

  expect(data).not.toBeNull();
  expect(data.error).toBeUndefined();
  expect(data.ts.top).toBe(4);
  expect(data.ts.bottom).toBe(4);
  expect(data.notes.length).toBeGreaterThan(0);
  expect(data.barLines.length).toBeGreaterThan(0);

  // First note should be at the HEAD line
  expect(Math.abs(data.notes[0] - data.headX)).toBeLessThan(1);

  // Bar interval in x-pixels
  const barIntervalPx = data.ts.top * data.spacing;
  const noteHalfW = data.SPACING * 0.6;

  // Each bar line should be at headX + N * barIntervalPx - noteHalfW (within tolerance)
  for (let i = 0; i < data.barLines.length; i++) {
    const expected = data.headX + (i + 1) * barIntervalPx - noteHalfW;
    expect(Math.abs(data.barLines[i] - expected)).toBeLessThan(1);
  }

  // Check spacing consistency: consecutive notes should be spaced by
  // their beat difference * spacing. The first 8 notes of Ode to Joy
  // are all 0.5 beats apart (L:1/8, no duration multipliers).
  for (let i = 1; i < 8; i++) {
    const expectedDelta = 0.5 * data.spacing;
    const actualDelta = data.notes[i] - data.notes[i - 1];
    expect(Math.abs(actualDelta - expectedDelta)).toBeLessThan(2);
  }

  // Count notes within first complete bar (before first bar line)
  const firstBarLine = data.barLines[0];
  const notesInFirstBar = data.notes.filter(cx => cx < firstBarLine).length;
  // M:4/4, L:1/8 => 8 eighth notes per bar
  expect(notesInFirstBar).toBe(8);
});

test('time signature displays correctly on both staves for Ode to Joy', async ({ page }) => {
  await page.goto('/songs/sketches/sight-reading/');
  await page.waitForSelector('note-chart svg');

  const input = page.locator('#trainer-song');
  await input.click();
  const list = page.locator('#song-list.open');
  await expect(list).toBeVisible();
  await list.locator('li').filter({ hasText: 'Ode to Joy' }).click();
  await expect(input).toHaveValue('Ode to Joy');
  await page.waitForTimeout(100);

  const tsTexts = await page.evaluate(() => {
    const ann = document.querySelector('#staff-annotations');
    if (!ann) return [];
    const texts = ann.querySelectorAll('text');
    const results = [];
    for (const t of texts) {
      results.push({ x: t.getAttribute('x'), y: t.getAttribute('y'), content: t.textContent });
    }
    return results;
  });

  // Should have 4 time signature numbers (top+bottom on treble, top+bottom on bass)
  // For M:4/4, both top and bottom are "4"
  const tsNums = tsTexts.filter(t => t.content === '4');
  expect(tsNums.length).toBe(4);

  // Pair up: each top number should have a matching bottom at the same x,
  // and the top number should have smaller y (above)
  for (let i = 0; i < tsNums.length; i += 2) {
    const topNum = tsNums[i];
    const bottomNum = tsNums[i + 1];
    expect(Math.abs(parseFloat(bottomNum.x) - parseFloat(topNum.x))).toBeLessThan(1);
    expect(parseFloat(topNum.y)).toBeLessThan(parseFloat(bottomNum.y));
  }
});

test('bar lines do not overlap note heads for Ode to Joy', async ({ page }) => {
  await page.goto('/songs/sketches/sight-reading/');
  await page.waitForSelector('note-chart svg');

  const input = page.locator('#trainer-song');
  await input.click();
  const list = page.locator('#song-list.open');
  await expect(list).toBeVisible();
  await list.locator('li').filter({ hasText: 'Ode to Joy' }).click();
  await expect(input).toHaveValue('Ode to Joy');
  await page.waitForTimeout(100);

  const positions = await page.evaluate(() => {
    const heads = document.querySelector('#note-heads');
    if (!heads) return null;
    const noteXs = [];
    const barXs = [];
    for (const child of heads.children) {
      if (child.tagName === 'line') {
        barXs.push(parseFloat(child.getAttribute('x1')));
      } else if (child.tagName === 'g') {
        const ellipse = child.querySelector('ellipse');
        if (ellipse) {
          const cx = parseFloat(ellipse.getAttribute('cx'));
          const rx = parseFloat(ellipse.getAttribute('rx'));
          noteXs.push({ cx, rx });
        }
      }
    }
    return { notes: noteXs, barLines: barXs };
  });

  expect(positions).not.toBeNull();

  // No bar line x should fall inside any note head's bounding box
  // Bar lines are offset left by noteHalfW, so they sit at the left edge of the note
  for (const barX of positions.barLines) {
    for (const note of positions.notes) {
      const leftEdge = note.cx - note.rx;
      const rightEdge = note.cx + note.rx;
      const overlaps = barX > leftEdge + 0.5 && barX < rightEdge - 0.5;
      expect(overlaps).toBe(false);
    }
  }
});
