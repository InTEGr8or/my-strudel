const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  parsePlayerNotes,
  parseChordGroups,
  whiteCountForWidth,
  midisCenteredOnC4,
  nextScrollTarget,
  N32_LOW,
  N32_HIGH,
  CENTER_MIDI,
  WHITE_KEY_PX,
} = require('../src/js/staff-player');

console.log('Testing staff-player helpers...');

const one = parsePlayerNotes('C4');
assert.strictEqual(one.length, 1);
assert.strictEqual(one[0].name, 'c4');
assert.strictEqual(one[0].midi, 60);

const chords = parseChordGroups('C3,E3,G3;C4,E4,G4');
assert.strictEqual(chords.length, 2);
assert.strictEqual(chords[0].length, 3);
assert.strictEqual(chords[0][0].midi, 48);
assert.strictEqual(chords[1][2].name, 'g4');
assert.ok(chords.every(function (g) {
  return g.every(function (n) { return n.midi >= N32_LOW && n.midi <= N32_HIGH; });
}), 'sample chord voicings fit the N32');

const seq = parsePlayerNotes('A3,B3,C4,F#4');
assert.strictEqual(seq.length, 4);
assert.strictEqual(seq[0].midi, 57);
assert.strictEqual(seq[3].name, 'fs4');
assert.strictEqual(seq[3].midi, 66);

assert.ok(seq.every(function (n) { return n.midi >= N32_LOW && n.midi <= N32_HIGH; }), 'sample notes fit the N32');
assert.strictEqual(N32_LOW, 41);
assert.strictEqual(N32_HIGH, 72);
assert.strictEqual(CENTER_MIDI, 60);
assert.strictEqual(WHITE_KEY_PX, 22);

function isWhite(m) {
  var pc = ((m % 12) + 12) % 12;
  return pc !== 1 && pc !== 3 && pc !== 6 && pc !== 8 && pc !== 10;
}

assert.strictEqual(whiteCountForWidth(780, 1), Math.floor(780 / 22));
const fitted = midisCenteredOnC4(whiteCountForWidth(780, 1));
const whites = fitted.filter(isWhite);
assert.ok(whites.length > 19, 'wide player adds keys beyond the N32');
assert.ok(fitted.indexOf(CENTER_MIDI) !== -1, 'C4 is on the keyboard');
const c4At = whites.indexOf(CENTER_MIDI);
assert.ok(Math.abs(c4At - (whites.length - 1) / 2) <= 1, 'C4 stays in the middle');

const src = fs.readFileSync(path.join(__dirname, '../src/js/staff-player.js'), 'utf-8');
assert.strictEqual(src.includes('data-extent="base"'), true, 'inline player uses the base staff');
assert.strictEqual(src.includes('staff-player-keys'), true, 'inline player has a compact piano');
assert.strictEqual(src.includes('playMidiNote'), true, 'compact keys share the page synth');
assert.strictEqual(src.includes('showShouldLabel'), true, 'wrong keys show the should-note');
assert.strictEqual(src.includes('nextScrollTarget'), true, 'finishing a player finds the next section');
assert.strictEqual(src.includes('nextStaffPlayer'), true, 'MIDI hands off to the next player');
assert.ok(src.includes('KeyboardRange.apply'), 'compact keys dim from the shared keyboard range, not a hardcoded N32');
assert.ok(src.includes('isCalibrating'), 'compact players do not eat keys while calibrating');
assert.strictEqual(src.includes('midi < N32_LOW'), false, 'compact player does not hardcode N32 dimming');

function fake(tag, next) {
  return { tagName: tag, nextElementSibling: next || null, getAttribute: function () { return null; } };
}
const h3 = fake('H3');
const player = fake('STAFF-PLAYER', h3);
assert.strictEqual(nextScrollTarget(player), h3, 'a finished player scrolls to the next heading');
const p = fake('P', fake('STAFF-PLAYER'));
const mid = fake('STAFF-PLAYER', p);
assert.strictEqual(nextScrollTarget(mid), p, 'the next try-it starts at the text before the next player');

const layout = fs.readFileSync(path.join(__dirname, '../src/_includes/layout.njk'), 'utf-8');
assert.strictEqual(layout.includes('staff-player.js'), true, 'layout loads the inline player');

const chart = fs.readFileSync(path.join(__dirname, '../src/js/note-chart.js'), 'utf-8');
assert.strictEqual(chart.includes('_extent'), true, 'note-chart has a base/full extent');
assert.ok(/extent !== ["']base["']/.test(chart), 'base staff hides the tempo mark');

console.log('PASS: staff-player parses notes and uses a compact base staff');
console.log('\nAll staff-player tests PASSED.');
