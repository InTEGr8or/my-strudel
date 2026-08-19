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
assert.strictEqual(page.includes('data-play='), false, 'letter chips are gone');
assert.ok((page.match(/<staff-player /g) || []).length >= 8, 'inline staff-players replace the chips');
assert.strictEqual(page.includes('notes="C4,C4,C4,C4,C4,C4,C4,C4"'), true, 'first player drills C eight times');
assert.strictEqual(page.includes('advance="#the-words"'), true, 'playing C forwards to the next section');
assert.strictEqual(page.includes('id="the-words"'), true, 'words section is a scroll target');
assert.strictEqual(page.includes('data-extent'), false, 'lesson markup uses staff-player, which owns the base staff');
assert.strictEqual(page.includes('Play this C'), true, 'lesson starts by playing, not by dumping words');
assert.ok(page.includes('grand staff'), 'first section names the grand staff');
assert.ok(page.includes('staff player'), 'first section names the staff player');
assert.ok(page.includes('Now'), 'first section teaches the Now line');
assert.ok(page.includes('cyan') || page.includes('light blue'), 'wrong keys are marked in cyan');
assert.ok(/D<\/strong>/.test(page) && page.includes('two black'), 'D is the landmark for finding C');
const playIdx = page.indexOf('<h2>Play this C</h2>');
const playerIdx = page.indexOf('<staff-player notes="C4,C4,C4,C4,C4,C4,C4,C4"');
const wordsIdx = page.indexOf('id="the-words"');
assert.ok(playIdx < playerIdx && playerIdx < wordsIdx, 'how-to text comes first, then eight Cs');
assert.ok(page.indexOf('grand staff') < playerIdx, 'staff is named before they play');
assert.strictEqual(page.slice(playIdx, wordsIdx).includes('middle C'), false, 'first section does not call it middle C');
assert.strictEqual(page.includes('<freq-lab'), true, 'octave uses the shared freq-lab');
assert.ok(page.indexOf('<h3 id="octave">') < page.indexOf('<freq-lab'), 'sound lab sits inside Octave');
assert.ok(page.indexOf('<freq-lab') < page.indexOf('notes="C4,C5,C4,C5,C4,C5,C4,C5"'), 'hear the octave before playing C to C');
assert.strictEqual(page.includes('notes="C4,C5,C4,C5,C4,C5,C4,C5"'), true, 'first octave is played four times');
assert.strictEqual(page.includes('Octave in D'), true, 'a second octave starts on D');
assert.strictEqual(page.includes('notes="D3,D4,D3,D4,D3,D4,D3,D4"'), true, 'D octave is also drilled four times');
assert.strictEqual(page.includes('12th fret'), false, 'guitar octave detour is gone');
assert.strictEqual(page.includes('freq-lab-heading'), false, 'freq lab is not its own late chapter');
assert.strictEqual(page.includes("mode: 'tape-head'"), true, 'practice box is a wait-mode tape');
assert.strictEqual(page.includes('pageNoteChart'), true, 'end trainer binds the page staff, not the first inline player');
assert.strictEqual(page.includes('lessonTunes'), true);
assert.strictEqual(page.includes('scale degree'), true);
assert.strictEqual(page.includes('tonic'), true);
assert.ok(page.toLowerCase().includes('interval'), 'interval is defined');
assert.ok(page.includes('octave'), 'octave is defined');
assert.ok(page.includes('Why do piano books often start at C'), 'explains C vs A');
assert.ok(page.indexOf('span class="word">Major</span>') < page.indexOf('Why do piano books often start at C'), 'C-vs-A comes after major and minor are named');
assert.ok(page.indexOf('Why do piano books often start at C') > page.indexOf('<h2>Interval</h2>'), 'C-vs-A sits near the end, not in the first words');
assert.ok(page.indexOf('Why do piano books often start at C') < page.indexOf('<h2>Longer sequences</h2>'), 'C-vs-A is just before the long try-its');
assert.ok(page.includes('span class="word">Major</span>'), 'defines major');
assert.ok(page.includes('span class="word">minor</span>'), 'defines minor');
assert.ok(page.includes('span class="word">perfect</span>'), 'defines perfect');
assert.ok(page.includes('span class="word">Augmented</span>'), 'defines augmented');
assert.strictEqual(page.includes('typing class'), false, 'no typing-class title');
assert.strictEqual(page.includes('REPL'), false, 'no computer-REPL language');
assert.strictEqual(/Think of it as a list, or a type/.test(page), false, 'scale is not called a computer type');

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
assert.strictEqual(layoutCss.includes('grid-template-columns: minmax(0, 1fr) 250px'), false, 'no reserved empty sidebar rail');
const sidebarCss = fs.readFileSync(path.join(root, 'src/css/sidebar.css'), 'utf-8');
assert.ok(sidebarCss.includes('aside.collapsed'), 'hamburger still slides the sidebar away');

console.log('PASS: foundations lesson has ' + tunes.length + ' N32-safe try-its and a sine lab');
console.log('\nAll foundations lesson tests PASSED.');
