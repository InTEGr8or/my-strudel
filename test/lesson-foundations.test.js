const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseAbc, splitAbcTunes } = require('../src/shared/parse-abc');
const { fitsKeyboardAbsolute } = require('../src/js/staff-layout');

const root = path.join(__dirname, '..');
const lessonDir = path.join(root, 'src/lessons/notes-intervals-degrees');

console.log('Testing notes-intervals-degrees lesson...');

assert.ok(fs.existsSync(path.join(lessonDir, 'index.md')));
assert.ok(fs.existsSync(path.join(lessonDir, 'exercises.abc')));

const page = fs.readFileSync(path.join(lessonDir, 'index.md'), 'utf-8');
assert.strictEqual(page.includes("type: \"lesson\""), true);
assert.strictEqual(page.includes('order: 0'), true, 'foundations lesson is first');
assert.strictEqual(page.includes('templateEngineOverride: njk'), true, 'lesson skips markdown so it cannot close main early');
assert.strictEqual(page.includes('data-play="C4"'), true, 'letter chips are playable');
assert.strictEqual(page.includes('freq-slider'), true, '440–880 Hz lab is on the page');
assert.strictEqual(page.includes("osc.type = 'sine'"), true);
assert.strictEqual(page.includes("mode: 'tape-head'"), true, 'practice box is a wait-mode tape');
assert.strictEqual(page.includes('lessonTunes'), true);
assert.strictEqual(page.includes('scale degree'), true);
assert.strictEqual(page.includes('tonic'), true);
assert.ok(page.toLowerCase().includes('interval'), 'interval is defined');
assert.ok(page.includes('octave'), 'octave is defined');

const abc = fs.readFileSync(path.join(lessonDir, 'exercises.abc'), 'utf-8');
const tunes = splitAbcTunes(abc);
assert.ok(tunes.length >= 20, 'many short try-it tunes, got ' + tunes.length);
const titles = {};
tunes.forEach(function (t) {
  assert.ok(t.notes.length > 0, t.title + ' has notes');
  assert.ok(fitsKeyboardAbsolute(t.notes, 41, 72), t.title + ' fits the N32');
  titles[t.title] = (titles[t.title] || 0) + 1;
});
assert.ok(Object.keys(titles).some(function (k) { return /again|more time|one more/i.test(k); }), 'some tries repeat the same idea');

const one = parseAbc(tunes[0].abc);
assert.strictEqual(one.notes[0].note, 'C');

const eleventy = fs.readFileSync(path.join(root, 'eleventy.config.js'), 'utf-8');
assert.strictEqual(eleventy.includes('lessonTunes'), true);
const layout = fs.readFileSync(path.join(root, 'src/_includes/layout.njk'), 'utf-8');
assert.ok(layout.includes("type != 'lesson'"), 'lesson pages do not load ABCJS from cdnjs');
const trainerCss = fs.readFileSync(path.join(root, 'src/css/trainer.css'), 'utf-8');
assert.strictEqual(trainerCss.includes('column-count: 2'), false, 'lesson prose is not split into newspaper columns');
const layoutCss = fs.readFileSync(path.join(root, 'src/css/layout.css'), 'utf-8');
assert.ok(layoutCss.includes('grid-template-columns: minmax(0, 1fr) 250px'), 'sidebar is a right-hand grid column, not under the piano');

console.log('PASS: foundations lesson has ' + tunes.length + ' N32-safe try-its and a sine lab');
console.log('\nAll foundations lesson tests PASSED.');
