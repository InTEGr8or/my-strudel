const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseAbc } = require('../src/shared/parse-abc');
const { classifyDuration } = require('../src/js/duration');
const { generateAbc, beatsToAbc } = require('../scripts/musicxml-to-abc');
const {
  parseMidiFile,
  verifyMidiAndAbc,
  matchNotes,
  siblingPairs,
  pitchOnlyScore,
} = require('../scripts/verify-midi-abc');

function assertEq(actual, expected, message) {
  assert.strictEqual(actual, expected, message || `${actual} !== ${expected}`);
}

console.log('Running MIDI/ABC alignment, duration, and rest tests...');

// --- Duration classifier (real values, not source greps) ---
console.log('\n--- classifyDuration ---');
assertEq(classifyDuration(6).name, 'dotted-whole', '6 beats is dotted whole');
assertEq(classifyDuration(6).dotted, true, 'dotted whole is dotted');
assertEq(classifyDuration(6).stem, false, 'dotted whole has no stem');
assertEq(classifyDuration(4).name, 'whole', '4 beats is whole');
assertEq(classifyDuration(4).dotted, false, 'whole is not dotted');
assertEq(classifyDuration(3).name, 'dotted-half', '3 beats is dotted half, not dotted whole');
assertEq(classifyDuration(2).name, 'half', '2 beats is half');
assertEq(classifyDuration(1.5).name, 'dotted-quarter');
assertEq(classifyDuration(1).name, 'quarter');
assertEq(classifyDuration(0.75).name, 'dotted-eighth');
assertEq(classifyDuration(0.5).name, 'eighth');
console.log('PASS: classifyDuration maps 6→dotted-whole, 4→whole, 3→dotted-half');

// --- parseAbc durations for dotted whole notes and rests ---
console.log('\n--- parseAbc dotted whole / rest durations ---');
const dottedWholeAbc = 'X:1\nT:Dotted Whole\nM:6/4\nL:1/16\nK:C\nC24 | z24 |]';
const dw = parseAbc(dottedWholeAbc);
assertEq(dw.notes.length, 1, 'one dotted whole note');
assertEq(dw.notes[0].duration, 6, `dotted whole duration is 6, got ${dw.notes[0].duration}`);
assertEq(dw.rests.length, 1, 'one dotted whole rest');
assertEq(dw.rests[0].duration, 6, `dotted whole rest duration is 6, got ${dw.rests[0].duration}`);
assertEq(dw.rests[0].startBeat, 6, 'rest follows the 6-beat note');
assertEq(classifyDuration(dw.notes[0].duration).name, 'dotted-whole');
assertEq(classifyDuration(dw.rests[0].duration).name, 'dotted-whole');
console.log('PASS: parseAbc C24 / z24 at L:1/16 are 6-beat dotted wholes');

const restGapAbc = 'X:1\nM:4/4\nL:1/16\nK:C\nC4 z12 G4 |';
const rg = parseAbc(restGapAbc);
assertEq(rg.notes.length, 2);
assertEq(rg.notes[0].startBeat, 0);
assertEq(rg.notes[1].startBeat, 4);
assertEq(rg.rests.length, 1);
assertEq(rg.rests[0].startBeat, 1);
assertEq(rg.rests[0].duration, 3);
console.log('PASS: parseAbc rest occupies 3 beats between notes');

const tiedAbc = 'X:1\nM:4/4\nL:1/16\nK:C\nC16- | C8 |]';
const tied = parseAbc(tiedAbc);
assertEq(tied.notes.length, 1, `tie merge should yield 1 note, got ${tied.notes.length}`);
assertEq(tied.notes[0].duration, 6, `tied whole+half is 6 beats, got ${tied.notes[0].duration}`);
console.log('PASS: parseAbc merges C16- | C8 into one 6-beat note');

// --- Matcher rejects pitch-only alignment ---
console.log('\n--- matchNotes requires start time ---');
const abcShifted = [
  { midi: 60, startBeat: 0, duration: 1 },
  { midi: 62, startBeat: 1, duration: 1 },
  { midi: 64, startBeat: 2, duration: 1 },
];
const midiOnTime = [
  { midi: 60, startBeat: 0, duration: 1 },
  { midi: 62, startBeat: 1, duration: 1 },
  { midi: 64, startBeat: 2, duration: 1 },
];
const midiLate = midiOnTime.map((n) => ({ ...n, startBeat: n.startBeat + 4 }));
const good = matchNotes(abcShifted, midiOnTime);
const bad = matchNotes(abcShifted, midiLate);
assertEq(good.matches.length, 3, 'on-time pitches match');
assertEq(bad.matches.length, 0, 'same pitches at wrong beats must not match');
assert.ok(pitchOnlyScore(abcShifted, midiLate) === 1, 'legacy pitch-only would have scored 100%');
console.log('PASS: matcher fails when pitches match but start beats do not');

// --- beatsToAbc and synthetic two-staff dotted half ---
console.log('\n--- generateAbc durations and voices ---');
assertEq(beatsToAbc(1), '4', 'quarter at L:1/16 is 4');
assertEq(beatsToAbc(2), '8', 'half is 8');
assertEq(beatsToAbc(3), '12', 'dotted half is 12, not 18');
assertEq(beatsToAbc(4), '16', 'whole is 16');
assertEq(beatsToAbc(6), '24', 'dotted whole is 24');

const syntheticXml = `<?xml version="1.0"?>
<score-partwise version="3.1">
  <work><work-title>Synthetic Dotted Half</work-title></work>
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths><mode>major</mode></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>6</duration>
        <voice>1</voice>
        <type>half</type>
        <dot/>
        <staff>1</staff>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration>
        <voice>1</voice>
        <type>eighth</type>
        <staff>1</staff>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration>
        <voice>1</voice>
        <type>eighth</type>
        <staff>1</staff>
      </note>
      <backup><duration>8</duration></backup>
      <note>
        <pitch><step>G</step><octave>2</octave></pitch>
        <duration>4</duration>
        <voice>5</voice>
        <type>half</type>
        <staff>2</staff>
      </note>
      <note>
        <pitch><step>D</step><octave>3</octave></pitch>
        <duration>4</duration>
        <voice>5</voice>
        <type>half</type>
        <staff>2</staff>
      </note>
    </measure>
    <measure number="2">
      <note>
        <rest/>
        <duration>8</duration>
        <voice>1</voice>
        <type>whole</type>
        <staff>1</staff>
      </note>
      <backup><duration>8</duration></backup>
      <note>
        <pitch><step>G</step><octave>2</octave></pitch>
        <duration>8</duration>
        <voice>5</voice>
        <type>whole</type>
        <staff>2</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

const tmpXml = path.join('/tmp', 'synthetic-dotted-half.xml');
fs.writeFileSync(tmpXml, syntheticXml);
const synAbc = generateAbc(tmpXml);
assert.ok(synAbc.includes('&'), `two-staff measure must emit ABC voice overlay, got:\n${synAbc}`);
assert.ok(!/\bD18\b/.test(synAbc), `must not emit D18 (1.5× dotted half), got:\n${synAbc}`);
assert.ok(/D12/.test(synAbc), `dotted half must be D12 at L:1/16, got:\n${synAbc}`);
assert.ok(/z16/.test(synAbc) || /z16 /.test(synAbc) || /z16/.test(synAbc), `whole rest should appear as z16, got:\n${synAbc}`);

const synParsed = parseAbc(synAbc);
const d4s = synParsed.notes.filter((n) => n.note === 'D' && n.oct === 4);
assert.ok(d4s.length >= 1, 'has D4');
assertEq(d4s[0].duration, 3, `first D4 is dotted half (3 beats), got ${d4s[0].duration}`);
assertEq(d4s[0].startBeat, 0);
const g2 = synParsed.notes.find((n) => n.note === 'G' && n.oct === 2 && n.startBeat === 0);
assert.ok(g2, 'bass G2 starts at beat 0 with the melody, not after it');
assertEq(g2.duration, 2, `bass G2 is a half note, got ${g2.duration}`);
const restWhole = synParsed.rests.find((r) => Math.abs(r.duration - 4) < 0.01);
assert.ok(restWhole, `whole rest of 4 beats present, rests=${JSON.stringify(synParsed.rests)}`);
console.log('PASS: generateAbc keeps dotted-half duration 3 and overlays bass at beat 0');
console.log('PASS: generateAbc emits a 4-beat rest instead of dropping it for a bass note');

// --- Sibling MIDI files: Jingle Bells must align in time ---
console.log('\n--- sibling MIDI/MXL pairs ---');
const dataDir = path.join(__dirname, '../data/musescore');
const pairs = siblingPairs(dataDir);
assert.ok(pairs.length > 0, 'found MIDI+MXL siblings');

const jingle = pairs.find((p) => p.stem === 'jingle-bells');
assert.ok(jingle, 'jingle-bells.mid + .mxl exist');
const jingleRes = verifyMidiAndAbc(jingle.midiPath, jingle.mxlPath);
assert.ok(
  jingleRes.timeAccuracy >= 0.9,
  `Jingle Bells pitch+start must be >= 90% (got ${(jingleRes.timeAccuracy * 100).toFixed(1)}%). Pitch-only was ${(jingleRes.pitchOnlyAccuracy * 100).toFixed(1)}%.`
);
assert.ok(
  Math.abs(jingleRes.lastStartAbc - jingleRes.lastStartMidi) <= 8,
  `Jingle Bells last start beat ABC ${jingleRes.lastStartAbc} vs MIDI ${jingleRes.lastStartMidi}`
);
assert.ok(jingleRes.restCount >= 1, 'Jingle Bells ABC includes rests');
console.log(`PASS: Jingle Bells pitch+start ${(jingleRes.timeAccuracy * 100).toFixed(1)}%`);

pairs.forEach((p) => {
  if (p.stem === 'jingle-bells') return;
  const res = verifyMidiAndAbc(p.midiPath, p.mxlPath);
  console.log(`  ${p.stem}: pitch+start ${(res.timeAccuracy * 100).toFixed(1)}%  (legacy pitch-only ${(res.pitchOnlyAccuracy * 100).toFixed(1)}%) last MIDI ${res.lastStartMidi} ABC ${res.lastStartAbc}`);
  assert.ok(
    res.timeAccuracy + 0.001 < res.pitchOnlyAccuracy || res.timeAccuracy >= 0.85,
    `${p.stem}: time-aware score must not collapse to the old pitch-only metric unless alignment is actually high`
  );
});

// Inflated 4.5-beat "dotted" values are the old double-dot bug
const jingleAbc = generateAbc(jingle.mxlPath);
const jingleParsed = parseAbc(jingleAbc);
const inflated = jingleParsed.notes.filter((n) => Math.abs(n.duration - 4.5) < 0.01);
assertEq(inflated.length, 0, `Jingle Bells must not contain 4.5-beat notes (double-counted dots), found ${inflated.length}`);
console.log('PASS: Jingle Bells has no 4.5-beat inflated dotted notes');

console.log('\n=================================================');
console.log('ALL MIDI/ABC ALIGNMENT TESTS PASSED.');
console.log('=================================================\n');
