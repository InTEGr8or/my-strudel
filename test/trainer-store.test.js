const assert = require('assert');
const { createTrainerStore } = require('../src/js/trainer-store');
const { computeStaffLayout, ledgerStaffIndices, indexToPitch, quarterBeatsPerBar, nextUnplayedStartBeat, matchMidiAtOnset, staffNoteLabel, metroBeatsPerBar, metroBeatDurationQuarters, metroIntervalMs } = require('../src/js/staff-layout');

console.log('Testing trainer store and staff layout...');

const store = createTrainerStore({ playing: true, bpm: 80, songTitle: 'Jingle Bells' });
assert.strictEqual(store.get().playing, true);
assert.strictEqual(store.get().songTitle, 'Jingle Bells');

let seen = null;
const unsub = store.subscribe(function (state, prev) {
  seen = { playing: state.playing, prevPlaying: prev.playing, songTitle: state.songTitle };
});

store.set({ songTitle: 'Moonlight Sonata', playing: false, bpm: 54, tempo: 54 });
assert.strictEqual(store.get().playing, false, 'song change must clear playing');
assert.strictEqual(store.get().songTitle, 'Moonlight Sonata');
assert.strictEqual(seen.playing, false);
assert.strictEqual(seen.prevPlaying, true, 'subscribers see the previous playing flag');
unsub();

store.set({ playing: true });
let afterUnsub = 0;
store.subscribe(function () { afterUnsub += 1; });
// previous listener must not fire
seen = null;
store.set({ playing: false });
assert.strictEqual(seen, null, 'unsubscribed listener does not run');
assert.strictEqual(afterUnsub, 1);

const waitStore = createTrainerStore({ wait: true, playing: false });
assert.strictEqual(waitStore.get().wait, true, 'wait is a first-class store flag');
waitStore.set({ songTitle: 'Take Five', playing: false });
assert.strictEqual(waitStore.get().wait, true, 'song change must not clear wait');
console.log('PASS: trainer store keeps wait across song changes');

const ns = [
  { startBeat: 0 },
  { startBeat: 0 },
  { startBeat: 1 },
  { startBeat: 2 },
];
assert.strictEqual(nextUnplayedStartBeat(ns, new Set(), new Set()), 0);
assert.strictEqual(nextUnplayedStartBeat(ns, new Set([0]), new Set()), 0, 'chord sibling still holds the head');
assert.strictEqual(nextUnplayedStartBeat(ns, new Set([0, 1]), new Set()), 1);
assert.strictEqual(nextUnplayedStartBeat(ns, new Set([0, 1, 2, 3]), new Set()), null);
const chord = [
  { startBeat: 0, midi: 60 },
  { startBeat: 0, midi: 64 },
  { startBeat: 0, midi: 67 },
  { startBeat: 1, midi: 60 },
];
const played = new Set();
const pitch = (n) => n.midi;
assert.strictEqual(matchMidiAtOnset(chord, played, new Set(), 60, 0, pitch), 0);
played.add(0);
assert.strictEqual(matchMidiAtOnset(chord, played, new Set(), 64, 0, pitch), 1);
played.add(1);
assert.strictEqual(matchMidiAtOnset(chord, played, new Set(), 67, 0, pitch), 2);
played.add(2);
assert.strictEqual(nextUnplayedStartBeat(chord, played, new Set()), 1, 'tape advances only after the full triad');
assert.strictEqual(matchMidiAtOnset(chord, played, new Set(), 60, 0, pitch), -1, 'already-claimed pitch is not rematched at this onset');
played.delete(0);
assert.strictEqual(matchMidiAtOnset(chord, played, new Set(), 60, 0, pitch), 0, 'a later attack of the same pitch can match if that member is still open');
const fMajor = [{ note: 'B', oct: 4, acc: 'flat' }];
assert.strictEqual(staffNoteLabel({ note: 'B', oct: 4, alter: -1 }, fMajor), 'B♭4', 'F major spells Bb, not A#');
assert.strictEqual(staffNoteLabel({ note: 'A', oct: 4, alter: 1, midi: 70 }, fMajor), 'B♭4', 'MIDI A# is labeled B♭ in a flat key');
assert.strictEqual(staffNoteLabel({ note: 'F', oct: 5, alter: 1 }), 'F♯5');
assert.strictEqual(staffNoteLabel({ note: 'A', oct: 5, alter: 0 }), 'A5');
assert.strictEqual(staffNoteLabel({ note: 'B', oct: 4, alter: 0, accidental: 'natural' }, fMajor), 'B♮4');
console.log('PASS: target labels include the accidental the player should expect');
console.log('PASS: three simultaneous note-ons each claim a chord member without a busy lock');

assert.strictEqual(metroBeatsPerBar({ top: 4, bottom: 4 }), 4);
assert.strictEqual(metroBeatsPerBar({ top: 3, bottom: 4 }), 3);
assert.strictEqual(metroBeatsPerBar({ top: 5, bottom: 4 }), 5);
assert.strictEqual(metroBeatsPerBar({ top: 2, bottom: 2 }), 2);
assert.strictEqual(metroBeatsPerBar({ top: 6, bottom: 8 }), 2, '6/8 conducts in two dotted quarters');
assert.strictEqual(metroBeatDurationQuarters({ top: 4, bottom: 4 }), 1);
assert.strictEqual(metroBeatDurationQuarters({ top: 2, bottom: 2 }), 2);
assert.strictEqual(metroBeatDurationQuarters({ top: 6, bottom: 8 }), 1.5);
assert.strictEqual(metroIntervalMs(120, { top: 4, bottom: 4 }), 500);
assert.strictEqual(metroIntervalMs(120, { top: 6, bottom: 8 }), 750);
console.log('PASS: metronome pulse follows the time signature, not a hard-coded 4/4');

const layout = computeStaffLayout(1);
assert.strictEqual(layout.LEFT_MARGIN, 50, '50px left of the staff');
assert.strictEqual(layout.BOT_EXTRA, 75, '75 extra pixels below the staff');
assert.ok(layout.BOT_PAD >= 80 + 75, `BOT_PAD is ${layout.BOT_PAD}, expected >= 155`);
assert.strictEqual(layout.clefX, 65, 'clef stays at original 15px offset after the 50px left margin');
assert.ok(layout.keyX > layout.clefX, `key column x ${layout.keyX} must be right of clef x ${layout.clefX}`);
assert.ok(layout.clefX < layout.timeX, `clef x ${layout.clefX} must be left of time x ${layout.timeX}`);
assert.ok(layout.keyX < layout.timeX, 'key column is left of the time signature');
assert.ok(layout.timeX < layout.COLOR_X, 'time signature left of color guide');
assert.ok(layout.COLOR_X < layout.LEFT_PAD, 'color guide left of note content');
assert.ok(layout.LEFT_PAD - layout.clefX >= layout.KEY_COL_W + 42, 'key column width pushes notes right of the clef');
assert.strictEqual(layout.STAFF_L, 50, 'staff lines start after the 50px left margin');

const scaled = computeStaffLayout(2);
assert.strictEqual(scaled.LEFT_MARGIN, 100);
assert.strictEqual(scaled.BOT_EXTRA, 150);
assert.ok(scaled.keyX > scaled.clefX);
assert.strictEqual(scaled.clefX, 50 * 2 + 15 * 2);

console.log('PASS: staff layout has 50px left margin, +75px below, key column right of clef');

function pitchSet(idxs) {
  return idxs.map((i) => {
    const p = indexToPitch(i);
    return p.note + p.oct;
  }).join(',');
}

assert.strictEqual(pitchSet(ledgerStaffIndices('B', 2)), '', 'B2 is on the bass staff — no ledger');
assert.strictEqual(pitchSet(ledgerStaffIndices('G', 2)), '', 'G2 is the bottom bass line — no ledger');
assert.strictEqual(pitchSet(ledgerStaffIndices('A', 3)), '', 'A3 is the top bass line — no ledger');
assert.strictEqual(pitchSet(ledgerStaffIndices('E', 4)), '', 'E4 is the bottom treble line — no ledger');
assert.strictEqual(pitchSet(ledgerStaffIndices('C', 4)), 'C4', 'middle C gets one ledger');
assert.strictEqual(pitchSet(ledgerStaffIndices('E', 2)), 'E2', 'E2 gets the first ledger below the bass');
assert.strictEqual(pitchSet(ledgerStaffIndices('D', 2)), 'E2', 'D2 sits under the E2 ledger only');
assert.strictEqual(pitchSet(ledgerStaffIndices('C', 2)), 'E2,C2', 'C2 needs two ledgers');
assert.strictEqual(pitchSet(ledgerStaffIndices('A', 1)), 'E2,C2,A1', 'A1 needs three ledgers');
assert.strictEqual(pitchSet(ledgerStaffIndices('A', 5)), 'A5', 'A5 is the first ledger above the treble');
assert.strictEqual(pitchSet(ledgerStaffIndices('C', 6)), 'A5,C6', 'C6 needs two ledgers above the treble');
assert.strictEqual(pitchSet(ledgerStaffIndices('E', 6)), 'A5,C6,E6', 'E6 needs three ledgers');
console.log('PASS: ledger lines cover low/high notes and skip in-staff pitches like B2');

assert.strictEqual(quarterBeatsPerBar({ top: 4, bottom: 4 }), 4, '4/4 is 4 quarter beats');
assert.strictEqual(quarterBeatsPerBar({ top: 3, bottom: 4 }), 3, '3/4 is 3 quarter beats');
assert.strictEqual(quarterBeatsPerBar({ top: 2, bottom: 2 }), 4, '2/2 is 4 quarter beats, not 2');
assert.strictEqual(quarterBeatsPerBar({ top: 6, bottom: 8 }), 3, '6/8 is 3 quarter beats, not 6');
assert.strictEqual(quarterBeatsPerBar({ top: 5, bottom: 4 }), 5, '5/4 is 5 quarter beats');
assert.strictEqual(quarterBeatsPerBar({ top: 12, bottom: 8 }), 6, '12/8 is 6 quarter beats');
console.log('PASS: bar lines use quarter-note bar length so 2/2 and 6/8 do not cut through notes');

const { parseAbc } = require('../src/shared/parse-abc');
const twoVoice = parseAbc('X:1\nM:4/4\nL:1/16\nK:C\nC4 z4 E4 F4 & G,,8 z8 |\n');
assert.strictEqual(twoVoice.rests.length, 2);
assert.strictEqual(twoVoice.rests[0].voice, 0);
assert.strictEqual(twoVoice.rests[1].voice, 1);
assert.ok(twoVoice.notes.some((n) => n.voice === 1 && n.startBeat === 0), 'bass note at beat 0');
console.log('PASS: rests carry voice so they can sit on the empty staff, not on top of a note');

console.log('\nAll trainer store & staff layout tests PASSED.');
