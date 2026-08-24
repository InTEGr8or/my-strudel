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
assert.strictEqual(page.includes('data-play='), false, 'old letter chips stay gone');
assert.ok(page.includes('class="play-note"') && page.includes('data-midi="64"'), 'C major table letters are playable');
assert.ok(page.includes('data-midi="72"'), 'the upper C in C major is C5');
assert.ok((page.match(/<staff-player /g) || []).length >= 8, 'inline staff-players replace the chips');
assert.strictEqual(page.includes('notes="C4,C4,C4,C4,C4,C4,C4,C4"'), true, 'first player drills C eight times');
assert.strictEqual(page.includes('advance="#music-parts"'), true, 'playing C forwards to the next section');
assert.strictEqual(page.includes('id="music-parts"'), true, 'names section is a scroll target');
assert.strictEqual(page.includes('The names of the parts of music'), true);
assert.strictEqual(page.includes('The words, one at a time'), false, 'heading is not about our method');
assert.strictEqual(page.includes('data-extent'), false, 'lesson markup uses staff-player, which owns the base staff');
assert.strictEqual(page.includes('Play this C'), true, 'lesson starts by playing, not by dumping words');
assert.ok(page.includes('press keys'), 'opening sells playing, not the widget');
assert.ok(page.indexOf('press keys') < page.indexOf('grand staff'), 'music comes before the staff tool');
assert.ok(page.includes('grand staff'), 'first section still names the grand staff');
assert.strictEqual(/this is our <strong>staff player<\/strong>/.test(page), false, 'we do not introduce the widget as the point');
assert.ok(page.includes('Now'), 'first section teaches the Now line');
assert.ok(page.includes('cyan') || page.includes('light blue'), 'wrong keys are marked in cyan');
assert.ok(/D<\/strong>/.test(page) && page.includes('two black'), 'D is the landmark for finding C');
assert.ok(page.includes("pianoDiagram 'piano-d-key.svg'"), 'finding D uses an SVG of the compact keys');
assert.ok(page.includes("pianoDiagram 'piano-a-to-g.svg'"), 'A through G is shown after the midway explanation');
assert.strictEqual(page.includes('<img class="piano-d-key"'), false, 'diagrams are inline SVGs, not pictures');
assert.ok(page.includes('72px * var(--ui-scale'), 'key diagrams are sized like the compact keyboard');
assert.ok(page.includes('whole, half, whole'), 'D is midway in steps from A and from G');
const eleventyCfg = fs.readFileSync(path.join(root, 'eleventy.config.js'), 'utf-8');
assert.ok(eleventyCfg.includes('piano-d-key.svg'), 'the D-key SVG is copied into the site');
assert.ok(eleventyCfg.includes('piano-a-to-g.svg'), 'the A-to-G SVG is copied into the site');
const playIdx = page.indexOf('<h2>Play this C</h2>');
const playerIdx = page.indexOf('<staff-player notes="C4,C4,C4,C4,C4,C4,C4,C4"');
const wordsIdx = page.indexOf('id="music-parts"');
assert.ok(playIdx < playerIdx && playerIdx < wordsIdx, 'how-to text comes first, then eight Cs');
assert.strictEqual(page.slice(playIdx, wordsIdx).includes('middle C'), false, 'first section does not call it middle C');
assert.strictEqual(page.includes('<freq-lab'), true, 'octave uses the shared freq-lab');
assert.ok(page.indexOf('<h3 id="octave">') < page.indexOf('<freq-lab'), 'sound lab sits inside Octave');
assert.ok(page.indexOf('<freq-lab') < page.indexOf('notes="C4,C5,C4,C5,C4,C5,C4,C5"'), 'hear the octave before playing C to C');
assert.strictEqual(page.includes('notes="C4,C5,C4,C5,C4,C5,C4,C5"'), true, 'first octave is played four times');
assert.strictEqual(page.includes('Octave in D'), true, 'a second octave starts on D');
assert.strictEqual(page.includes('notes="D3,D4,D3,D4,D3,D4,D3,D4"'), true, 'D octave is also drilled four times');
assert.strictEqual(page.includes('12th fret'), false, 'guitar octave detour is gone');
assert.strictEqual(page.includes('freq-lab-heading'), false, 'freq lab is not its own late chapter');
assert.strictEqual(page.includes('id="tune-list"'), false, 'ABC tune cards are gone; practice is inline');
assert.strictEqual(page.includes('hidePageStaff'), true, 'foundations does not mount an empty page staff');
assert.strictEqual(page.includes('Longer sequences'), false, 'no leftover your-turn card grid');
assert.strictEqual(page.includes('scale degree'), true);
assert.strictEqual(page.includes('tonic'), true);
assert.ok(page.toLowerCase().includes('interval'), 'interval is defined');
assert.ok(page.includes('not</strong> always a whole step') || page.includes('not always a whole step'), 'a whole step is only one interval');
assert.ok(page.includes('second</strong> (count 2) is not always a whole step') || page.includes('A second'), 'a second can be half or whole');
assert.ok(page.includes('<th>Interval</th>'), 'the table names the interval in its own column');
assert.ok(page.includes('minor second'), 'the 12-semitone table includes the half step');
assert.ok(page.includes('minor third'), 'the table includes the missing odd sizes');
assert.strictEqual(page.includes('notes="C4,E4,C4,E4,C4,E4,C4,E4"'), true, 'major third is played four times');
assert.strictEqual(page.includes('notes="A3,C4,A3,C4,A3,C4,A3,C4"'), true, 'minor third is played four times');
assert.strictEqual(page.includes('notes="C4,C#4,C4,C#4,C4,C#4,C4,C#4"'), true, 'half step is played four times');
assert.ok(page.includes('octave'), 'octave is defined');
assert.ok(page.includes('solfège') || page.includes('solfege'), 'letter names mention solfège');
assert.ok(page.includes('do is C'), 'solfège do is taught as C');
assert.ok(page.includes('12 keys') || page.includes('12 semitones'), 'the octave is partitioned into 12');
assert.ok(page.includes('B and C') || page.includes('B to C'), 'B–C is named as a close pair');
assert.ok(page.includes('E and F') || page.includes('E to F'), 'E–F is named as a close pair');
assert.ok(page.includes('B2,C3'), 'B–C is drilled in more than one octave');
assert.ok(page.includes('E3,F3'), 'E–F is drilled in more than one octave');
assert.ok(page.includes('C3,C4,C5'), 'tonic C is played in three octaves');
assert.ok(page.includes('C3,E3,G3;C4,E4,G4'), 'C major is played in more than one octave');
assert.ok(page.includes('C major</strong> — C–E–G') || page.includes('C major</strong> — C'), 'each chord player has its own caption');
assert.ok(page.includes('Why do piano books often start at C'), 'explains C vs A');
assert.ok(page.indexOf('span class="word">Major</span>') < page.indexOf('Why do piano books often start at C'), 'C-vs-A comes after major and minor are named');
assert.ok(page.indexOf('Why do piano books often start at C') > page.indexOf('<h2>Interval</h2>'), 'C-vs-A sits near the end, not in the first words');
assert.ok(page.includes('span class="word">Major</span>'), 'defines major');
assert.ok(page.includes('span class="word">minor</span>'), 'defines minor');
assert.ok(page.includes('W W H W W W H'), 'major scale is a whole/half pattern');
assert.ok(page.includes('2 2 1 2 2 2 1'), 'major pattern is also counted in half-steps');
assert.ok(page.includes('W W H W W W H (2 2 1 2 2 2 1)'), 'prose repeats the half-step count next to W/H');
assert.ok(page.includes('W H W W H W W'), 'natural minor is a whole/half pattern');
assert.ok(page.includes('2 1 2 2 1 2 2'), 'minor pattern is also counted in half-steps');
assert.ok(page.includes('<th>Half-steps</th>'), 'W/H tables include a half-step count');
assert.ok(page.includes('4, then 3'), 'chord gaps are one number each, in half-steps');
assert.ok(page.includes('W+W, then W+H'), 'chord W/H uses plus, not a play-list of W W');
assert.ok(page.includes('whole step is always two half steps'), 'W is two H');
assert.ok(page.includes('B to C is a half step'), 'B–C is named a half step');
assert.ok(page.includes('A3,A#3,B3,C4'), 'half steps are drilled chromatically from A');
assert.ok(page.includes('G#4,A4'), 'the chromatic drill includes G♯ and the next A');
assert.strictEqual(page.includes('F#4,G#4,A#4,C5'), false, 'the naming history is short prose, not a new whole-tone drill');
assert.ok(page.includes('C–E–G'), 'chords are shown as stacked wholes and halves');
assert.ok((page.match(/up and down, twice/g) || []).length >= 3, 'scales are drilled up and down twice');
assert.ok(page.includes('span class="word">perfect</span>'), 'defines perfect');
assert.ok(page.includes('span class="word">Augmented</span>'), 'defines augmented');
assert.strictEqual(page.includes('typing class'), false, 'no typing-class title');
assert.strictEqual(page.includes('REPL'), false, 'no computer-REPL language');
assert.strictEqual(/Think of it as a list, or a type/.test(page), false, 'scale is not called a computer type');

(page.match(/<staff-player notes="([^"]+)"/g) || []).forEach(function (tag) {
  const notes = tag.match(/notes="([^"]+)"/)[1];
  if (notes.indexOf(';') !== -1) {
    assert.ok(notes.split(';').length >= 4, tag + ' should repeat the chord');
  } else {
    assert.ok(notes.split(',').length >= 8, tag + ' should be an exercise, not a single pass');
  }
});

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
