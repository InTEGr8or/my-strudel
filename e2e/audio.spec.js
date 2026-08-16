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

test('AudioContext is created and running after first click', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.waitForSelector('#piano-container');

  expect(await page.evaluate(() => window.__midiAudioCtx())).toBeNull();

  await page.locator('body').click();
  await page.waitForFunction(() => {
    const ctx = window.__midiAudioCtx();
    return ctx && ctx.state === 'running';
  });
});

test('AudioContext initializes even when clicking stopPropagation elements (capture phase)', async ({ page }) => {
  await page.goto('/songs/sketches/sight-reading/');
  await page.waitForSelector('note-chart svg');

  await page.locator('#trainer-song').click();
  const toggle = page.locator('#song-toggle');
  await toggle.click();

  const running = await page.evaluate(() => {
    const ctx = window.__midiAudioCtx();
    return ctx && ctx.state === 'running';
  });
  expect(running).toBe(true);
});

test('playMidiNote transitions AudioContext to running', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.waitForSelector('#piano-container');

  await page.evaluate(() => window.selectVoice('triangle'));
  await page.evaluate(() => window.playMidiNote(60, 100));

  const state = await page.evaluate(() => {
    const ctx = window.__midiAudioCtx();
    return ctx ? ctx.state : 'no ctx';
  });
  expect(state).toBe('running');
});

test('handleMidiMessage continues processing when playMidiNote errors are isolated', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.waitForSelector('#piano-container');

  await page.evaluate(() => {
    window.__midiObservers.push((note, on, off) => {
      const existing = document.getElementById('observer-hook');
      if (existing) existing.textContent = 'observer ran for ' + note;
    });
    const hook = document.createElement('div');
    hook.id = 'observer-hook';
    document.body.appendChild(hook);
  });

  const status = page.locator('#midi-status');
  await status.waitFor({ state: 'attached' });

  await page.evaluate(() => {
    const event = { data: [0x90, 60, 100] };
    window.handleMidiMessage(event);
  });

  await expect(page.locator('#observer-hook')).not.toHaveText('');
});

test('soundfont loads and zone lookup succeeds', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.waitForSelector('#piano-container');
  await page.locator('body').click();
  await page.waitForFunction(() => {
    const ctx = window.__midiAudioCtx();
    return ctx && ctx.state === 'running';
  });

  const result = await page.evaluate(async () => {
    const preset = await window.loadFontData('0000_JCLive_sf2_file');
    if (!preset || !Array.isArray(preset) || preset.length === 0) return 'no preset';
    for (const z of preset) {
      if (!z.file) return 'zone missing file';
    }
    return 'ok';
  });
  expect(result).toBe('ok');
});

test('decodeBuffer decodes audio data for MIDI 60', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.waitForSelector('#piano-container');
  await page.locator('body').click();
  await page.waitForFunction(() => {
    const ctx = window.__midiAudioCtx();
    return ctx && ctx.state === 'running';
  });

  const result = await page.evaluate(async () => {
    const ctx = window.__midiAudioCtx();
    const preset = await window.loadFontData('0000_JCLive_sf2_file');
    const zone = preset.find(z => z.keyRangeLow <= 60 && z.keyRangeHigh + 1 >= 60);
    if (!zone) return 'no zone';
    if (!zone.file) return 'no file';

    const decoded = atob(zone.file);
    const buf = new ArrayBuffer(decoded.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < decoded.length; i++) view[i] = decoded.charCodeAt(i);

    const audioBuffer = await new Promise((resolve, reject) => {
      ctx.decodeAudioData(buf, resolve, reject);
    });
    return [
      'ok',
      'duration:' + audioBuffer.duration.toFixed(2),
      'channels:' + audioBuffer.numberOfChannels,
      'sampleRate:' + audioBuffer.sampleRate,
    ].join(',');
  });
  expect(result).toMatch(/^ok/);
  expect(result).toContain('duration:');
  expect(result).toContain('channels:');
});

test('grand-piano and fallback oscillator both produce no-throw output', async ({ page }) => {
  await page.goto('/songs/sketches/mary-had-a-little-lamb/');
  await page.waitForSelector('#piano-container');
  await page.locator('body').click();
  await page.waitForFunction(() => {
    const ctx = window.__midiAudioCtx();
    return ctx && ctx.state === 'running';
  });

  const result = await page.evaluate(() => {
    const results = [];
    try {
      window.selectVoice('grand-piano');
      window.playMidiNote(60, 100);
      results.push('grand-piano:ok');
    } catch (e) {
      results.push('grand-piano:' + e.message);
    }
    try {
      window.playMidiNote(10, 100);
      results.push('fallback:ok');
    } catch (e) {
      results.push('fallback:' + e.message);
    }
    try {
      window.selectVoice('triangle');
      window.playMidiNote(72, 127);
      results.push('triangle:ok');
    } catch (e) {
      results.push('triangle:' + e.message);
    }
    return results.join(', ');
  });
  expect(result).toContain('grand-piano:ok');
  expect(result).toContain('fallback:ok');
  expect(result).toContain('triangle:ok');
});
