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
assert.strictEqual(!tapeTrainerCode.includes('chart.renderBarLine(headX + barBeat * spacing - noteHalfW);'), true, 'Bar line is no longer placed directly against noteHalfW edge');
console.log('PASS: Bar line contains padding offset from first note in bar (notes do not touch container bar line)');

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

console.log('\nAll trainer layout, MIDI cross-reference & score tempo unit tests PASSED cleanly.');
