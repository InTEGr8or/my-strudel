const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseAbc } = require('../src/shared/parse-abc');

console.log('Testing Sight-Reading Trainer Layout, Chords & Rest Rendering...');

// Test 1: Verify WINDOW_BEATS is at least 8 (so at least 2 full 4/4 bars fit on screen)
const tapeTrainerCode = fs.readFileSync(path.join(__dirname, '../src/js/tape-trainer.js'), 'utf-8');
const matchWindow = tapeTrainerCode.match(/var\s+WINDOW_BEATS\s*=\s*(\d+)/);
assert.ok(matchWindow, 'WINDOW_BEATS defined in tape-trainer.js');
const windowBeats = parseInt(matchWindow[1], 10);
assert.strictEqual(windowBeats >= 8, true, `WINDOW_BEATS is ${windowBeats}, expected >= 8 (at least 2 bars visible)`);
console.log(`PASS: Trainer displays at least 2 full bars on screen (WINDOW_BEATS = ${windowBeats})`);

// Test 2: Verify Bar Line Padding from Notehead (notes do not touch the bar line)
const matchOffset = tapeTrainerCode.match(/var\s+barOffset\s*=\s*([^;]+);/);
assert.ok(matchOffset, 'barOffset defined in tape-trainer.js');
assert.strictEqual(tapeTrainerCode.includes('barOffset'), true, 'barOffset is used to pad bar line from notehead');
assert.strictEqual(tapeTrainerCode.includes('quarterBeatsPerBar') || tapeTrainerCode.includes('ts.bottom'), true, 'bar interval uses the time-signature denominator, not only ts.top');
assert.strictEqual(tapeTrainerCode.includes('noteHalfW'), true, 'bar offset is at least a notehead half-width');
console.log('PASS: Bar line sits left of the notehead and uses quarter-note bar length');

// Test 3: Verify Simultaneous Chord Note Extraction in parseAbc
const chordAbc = 'X:1\nM:4/4\nL:1/16\nK:C\n[e4c4] [E4C4] z4 |\n';
const parsedChord = parseAbc(chordAbc);
assert.strictEqual(parsedChord.notes.length, 4, `Expected 4 notes from chords [e4c4] [E4C4], got ${parsedChord.notes.length}`);
assert.strictEqual(parsedChord.notes[0].startBeat, 0, 'First note in chord has startBeat 0');
assert.strictEqual(parsedChord.notes[1].startBeat, 0, 'Second note in chord has startBeat 0');
assert.strictEqual(parsedChord.notes[2].startBeat, 1, 'Third note in second chord has startBeat 1');
assert.strictEqual(parsedChord.notes[3].startBeat, 1, 'Fourth note in second chord has startBeat 1');
assert.strictEqual(parsedChord.rests.length, 1, `Expected 1 rest z4, got ${parsedChord.rests.length}`);
console.log('PASS: parseAbc parses all chord notes simultaneously with identical startBeat and parses rests');

// Test 4: Verify SVG Vector Rest Shapes in note-chart.js
const noteChartCode = fs.readFileSync(path.join(__dirname, '../src/js/note-chart.js'), 'utf-8');
assert.strictEqual(noteChartCode.includes("id=\"head-ghosts\""), true, 'held keys draw in a fixed #head-ghosts layer at the tape head');
assert.strictEqual(noteChartCode.includes("id=\"note-labels\""), true, 'should-notes live in a fixed #note-labels layer');
assert.ok(noteChartCode.indexOf('id="staff-bands"') < noteChartCode.indexOf('id="note-labels"'), 'should-notes are painted after staff-bands');
assert.ok(noteChartCode.indexOf('id="note-labels"') < noteChartCode.indexOf('id="staff-content"'), 'should-notes sit before the Now tape-head / scrolling notes');
assert.strictEqual(noteChartCode.includes('staff-band-label'), true, 'staff-bands are colored letters');
assert.strictEqual(noteChartCode.includes('rgba(${octaveColors[band]}'), false, 'staff-bands no longer paint octave background rects');
assert.strictEqual(noteChartCode.includes('renderBarNumber'), true, 'bar numbers are drawn on the staff');
assert.strictEqual(noteChartCode.includes('bar-number'), true, 'bar numbers use .bar-number');
assert.strictEqual(noteChartCode.includes("'0.14'"), true, 'bar numbers are 14% opacity');
assert.strictEqual(noteChartCode.includes('grandH * 2 / 3'), true, 'bar numbers are two-thirds the grand staff');
assert.strictEqual(noteChartCode.includes('staff-brace'), true, 'grand staff has a curly brace');
assert.strictEqual(noteChartCode.includes('_extent'), true, 'note-chart can render a base (tight) staff');
assert.strictEqual(noteChartCode.includes("extent !== 'base'"), true, 'base staff omits the tempo mark');
assert.strictEqual(noteChartCode.includes('this.renderHeadLine()'), true, 'every staff draws the Now line');
assert.strictEqual(noteChartCode.includes("setAttribute('opacity', '0.5')"), true, 'Now line is 50% opacity');
assert.strictEqual(noteChartCode.includes('showShouldLabel'), true, 'staff can paint should-note names');
assert.strictEqual(noteChartCode.includes('staffL - gap'), true, 'brace sits left of the staff');
assert.strictEqual(noteChartCode.includes('italic S'), true, 'brace is two italic S-curves, one reversed');
assert.strictEqual(noteChartCode.includes('x1 + 1.1 * width'), true, 'S inflection pulls back toward the staff');
assert.strictEqual(noteChartCode.includes('braceX + braceOffset'), false, 'brace no longer bulges onto the staff');
assert.strictEqual(tapeTrainerCode.includes('getShouldNoteX'), true, 'should-notes sit between the color guide and the Now head');
assert.strictEqual(tapeTrainerCode.includes('gutter - 30'), true, 'should-notes shift 30px left over the staff-bands');
assert.strictEqual(tapeTrainerCode.includes('22.4 * ctx.scale'), true, 'should-notes are 20% smaller than 28px');
assert.strictEqual(tapeTrainerCode.includes('renderBarNumber'), true, 'tape trainer draws a number in the middle of each bar');
assert.strictEqual(noteChartCode.includes('renderRest('), true, 'renderRest method exists');
assert.strictEqual(!noteChartCode.includes("symbol = '𝄽'"), true, 'renderRest no longer relies on unicode text glyphs');
assert.strictEqual(noteChartCode.includes("createElementNS(svgNs, 'rect')"), true, 'renderRest uses SVG vector rects/paths');
console.log('PASS: note-chart.js renders vector SVG rest shapes instead of font-dependent unicode text');

// Test 5: MIDI/ABC timing lives in test/midi-abc-align.test.js (pitch+start, not pitch-only).
console.log('SKIP: MIDI timing assertions moved to test/midi-abc-align.test.js');

// Test 6: Dotted-whole / rest duration classification lives in midi-abc-align.test.js
const { classifyDuration } = require('../src/js/duration');
assert.strictEqual(classifyDuration(6).name, 'dotted-whole');
assert.strictEqual(noteChartCode.includes('classified.dotted'), true, 'note-chart.js uses classifyDuration for augmentation dots');
console.log('PASS: note-chart.js uses shared duration classifier (dotted whole = 6 beats)');

const trainerPage = fs.readFileSync(path.join(__dirname, '../src/songs/sketches/sight-reading/index.md'), 'utf-8');
assert.strictEqual(trainerPage.includes('window.updateBpm(song.tempo)'), true, 'selecting a song sets metro-bpm to the score tempo');
assert.strictEqual(trainerPage.includes('createTrainerStore'), true, 'sight-reading page creates the trainer store');
assert.strictEqual(trainerPage.includes('playing: songChanged ? false : s.get().playing'), true, 'song change sets store.playing to false');
assert.strictEqual(trainerPage.includes('syncPlayButton'), true, 'play button is driven from store.playing');
assert.strictEqual(trainerPage.includes('function ensureStore'), true, 'store is created lazily so the page script can load before trainer-store.js');
assert.strictEqual(trainerPage.includes('toggleWaitTrainer'), true, 'Wait button sits next to Play');
assert.strictEqual(trainerPage.includes("localStorage.setItem('tape-wait'"), true, 'Wait is persisted in localStorage');
assert.strictEqual(trainerPage.includes("localStorage.setItem('tape-wait', 'false')"), true, 'Play turns Wait off');
console.log('PASS: song selection updates #metro-bpm and resets Play via the trainer store');

// Test 7: Verify parseAbc Q: tempo header parsing
const jingleAbcPath = path.join(__dirname, '../src/songs/sight-reading/songs/musescore/jingle-bells.abc');
if (fs.existsSync(jingleAbcPath)) {
  const jingleAbc = fs.readFileSync(jingleAbcPath, 'utf-8');
  const jingleParsed = parseAbc(jingleAbc);
  assert.strictEqual(jingleParsed.tempo, 140, `Jingle Bells parsed tempo is ${jingleParsed.tempo}, expected 140`);
  console.log('PASS: parseAbc correctly extracts Q:1/4=140 score tempo (got 140 BPM)');
}

const gotAbcPath = path.join(__dirname, '../src/songs/sight-reading/songs/musescore/game-of-thrones-easy-piano.abc');
if (fs.existsSync(gotAbcPath)) {
  const gotAbc = fs.readFileSync(gotAbcPath, 'utf-8');
  const gotParsed = parseAbc(gotAbc);
  assert.strictEqual(gotParsed.tempo, 168, `Game of Thrones parsed tempo is ${gotParsed.tempo}, expected 168`);
  console.log('PASS: parseAbc correctly extracts Q:1/4=168 score tempo (got 168 BPM)');
}

const sidebarSrc = fs.readFileSync(path.join(__dirname, '../src/_includes/components/sidebar.njk'), 'utf-8');
const uiSrc = fs.readFileSync(path.join(__dirname, '../src/_includes/components/scripts/ui.njk'), 'utf-8');
const initSrc = fs.readFileSync(path.join(__dirname, '../src/_includes/components/scripts/init.njk'), 'utf-8');
const layoutCss = fs.readFileSync(path.join(__dirname, '../src/css/layout.css'), 'utf-8');
assert.strictEqual(sidebarSrc.includes('id="bar-numbers-toggle"'), true, 'Synth tab has a Bar numbers switch under key tint');
assert.ok(sidebarSrc.indexOf('piano-tint-slider') < sidebarSrc.indexOf('bar-numbers-toggle'), 'Bar numbers toggle sits under the tint slider');
assert.strictEqual(sidebarSrc.includes('role="switch"'), true, 'Bar numbers control is a switch');
assert.strictEqual(uiSrc.includes('toggleBarNumbers'), true, 'toggleBarNumbers lives with the other synth settings');
assert.strictEqual(uiSrc.includes("show-bar-numbers"), true, 'bar-number visibility is persisted');
assert.strictEqual(initSrc.includes("show-bar-numbers"), true, 'saved bar-number setting is restored on load');
assert.strictEqual(noteChartCode.includes('setShowBarNumbers'), true, 'note-chart can hide bar numbers');
assert.strictEqual(layoutCss.includes('data-show-bar-numbers="false"'), true, 'CSS hides .bar-number when the switch is off');
console.log('PASS: Synth tab can toggle bar numbers and remembers the choice');

const synthSrc = fs.readFileSync(path.join(__dirname, '../src/_includes/components/scripts/synth.njk'), 'utf-8');
assert.strictEqual(synthSrc.includes("htmlBaseUrl"), true, 'soundfont fetch must use htmlBaseUrl so GitHub Pages /my-strudel/ works');
assert.strictEqual(synthSrc.includes("fetch(`/soundfonts/"), false, 'soundfont fetch must not be root-absolute');
assert.strictEqual(synthSrc.includes('0040_JCLive_sf2_file'), true, 'Wurlitzer uses JCLive electric piano 1');
assert.strictEqual(synthSrc.includes('0060_JCLive_sf2_file'), true, 'Harpsichord uses JCLive program 6');
assert.ok(fs.existsSync(path.join(__dirname, '../src/soundfonts/0040_JCLive_sf2_file.js')));
assert.ok(fs.existsSync(path.join(__dirname, '../src/soundfonts/0060_JCLive_sf2_file.js')));
console.log('PASS: soundfont URLs are prefixed for GitHub Pages');
console.log('PASS: Wurlitzer and Harpsichord soundfonts are vendored');

console.log('\nAll trainer layout, MIDI cross-reference & score tempo unit tests PASSED cleanly.');
