const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseAbc } = require('../src/shared/parse-abc');
const { analyzeNoteRange, fitsKeyboard, fitsKeyboardAbsolute } = require('../src/js/staff-layout');

const LOW = 41;
const HIGH = 72;
const root = path.join(__dirname, '..');

console.log('Testing ABC song pages and 32-key range...');

const layout = fs.readFileSync(path.join(root, 'src/_includes/layout.njk'), 'utf-8');
assert.strictEqual(layout.includes('showStaff'), true, 'layout computes showStaff');
assert.strictEqual(layout.includes("loadAbcjs = type != 'trainer'"), true, 'trainer pages skip ABCJS/cdnjs');
const headInc = fs.readFileSync(path.join(root, 'src/_includes/components/head.njk'), 'utf-8');
assert.strictEqual(headInc.includes('{% if showStrudel %}'), true, 'Strudel CDN loads only on Strudel pages');
assert.strictEqual(layout.includes("type == 'abc'"), true, 'ABC pages show the staff');
assert.strictEqual(layout.includes('{% if showStaff %}'), true, 'staff is gated');
assert.strictEqual(layout.includes("{% if showStrudel %}"), true, 'strudel editor is gated');
assert.strictEqual(layout.includes('abc-trainer.njk'), true, 'ABC pages include the tape trainer');
console.log('PASS: layout shows staff on ABC/trainer/lesson and hides it on Strudel pages');

const header = fs.readFileSync(path.join(root, 'src/_includes/components/header.njk'), 'utf-8');
assert.strictEqual(header.includes('showStrudel'), true, 'header Play/Stop only on Strudel pages');
const head = fs.readFileSync(path.join(root, 'src/_includes/components/head.njk'), 'utf-8');
const home = fs.readFileSync(path.join(root, 'src/index.njk'), 'utf-8');
assert.strictEqual(head.includes("'/favicon.svg' | htmlBaseUrl"), true, 'layout pages link the favicon with the Pages prefix');
assert.strictEqual(home.includes("'/favicon.svg' | htmlBaseUrl"), true, 'dashboard links the favicon with the Pages prefix');
assert.ok(fs.existsSync(path.join(root, 'src/favicon.svg')), 'favicon.svg is in src/');
console.log('PASS: favicon is on the dashboard and every layout page');

const eleventy = fs.readFileSync(path.join(root, 'eleventy.config.js'), 'utf-8');
assert.strictEqual(eleventy.includes("addTemplateFormats('strudel,tidal,abc')"), true, 'Eleventy registers .abc pages');
assert.strictEqual(eleventy.includes('isAbcCompanionFile'), true, 'companion ABC files are not pages');
assert.strictEqual(eleventy.includes("type: 'strudel'"), true, 'standalone .strudel files are type strudel');
assert.strictEqual(eleventy.includes('song.abc'), true, 'index.md can pair with song.abc');
console.log('PASS: Eleventy treats .abc like .strudel and skips MuseScore/lesson data files');

const sketches = [
  'src/songs/sketches/i-iv-v-i/song.abc',
  'src/songs/sketches/fifties-progression/song.abc',
  'src/songs/sketches/carol-ostinato/song.abc',
  'src/songs/sketches/old-macdonald/song.abc',
];
for (const rel of sketches) {
  const abc = fs.readFileSync(path.join(root, rel), 'utf-8');
  const parsed = parseAbc(abc);
  assert.ok(parsed.notes.length > 0, rel + ' parses notes');
  const range = analyzeNoteRange(parsed.notes);
  assert.strictEqual(
    fitsKeyboardAbsolute(parsed.notes, LOW, HIGH),
    true,
    rel + ' stays on F2–C5 (got midi ' + range.minMidi + '–' + range.maxMidi + ')'
  );
  assert.strictEqual(fitsKeyboard(parsed.notes, LOW, HIGH), true, rel + ' columns fit 32 keys');
  const hasChord = parsed.notes.some((n, i) =>
    parsed.notes.some((m, j) => j !== i && Math.abs(m.startBeat - n.startBeat) < 0.05)
  );
  assert.strictEqual(hasChord, true, rel + ' has simultaneous notes');
  console.log('PASS: ' + rel + ' midi ' + range.minMidi + '–' + range.maxMidi + ' colSpan ' + range.maxColumnSpan);
}

const carol = parseAbc(fs.readFileSync(path.join(root, sketches[2]), 'utf-8'));
assert.ok(carol.notes.some((n) => n.voice === 1), 'carol ostinato has a left-hand voice');

const trainer = fs.readFileSync(path.join(root, 'src/_includes/components/abc-trainer.njk'), 'utf-8');
assert.strictEqual(trainer.includes("mode: 'tape-head'"), true, 'ABC pages use the tape trainer');
assert.strictEqual(trainer.includes('setWait(true)'), true, 'ABC pages start in Wait mode');
console.log('PASS: ABC trainer defaults to wait-mode tape');

const chord = [
  { startBeat: 0, midi: 48 },
  { startBeat: 0, midi: 64 },
];
assert.strictEqual(analyzeNoteRange(chord).maxColumnSpan, 16);
assert.strictEqual(fitsKeyboard(chord, LOW, HIGH), true);
assert.strictEqual(fitsKeyboard([{ startBeat: 0, midi: 40 }, { startBeat: 0, midi: 80 }], LOW, HIGH), false);
console.log('PASS: range helper rejects columns wider than the keyboard');

console.log('\nAll ABC page tests PASSED.');
